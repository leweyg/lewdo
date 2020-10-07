//
//  hyperspace.h
//  lewdo_native
//
//  Created by Lewey Geselowitz on 10/6/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef hyperspace_h
#define hyperspace_h

namespace lewdo_shapes_hyperspace {
    
    struct range_t {
        double from;
        double to;
        
        range_t indexed_by_count(int index, int count) const {
            double step = (to - from) / ((double)count);
            range_t ans((from + (step * ((double)(index+0) ))) ,
                        (from + (step * ((double)(index+1)))));
             return ans;
        }
        
        range_t() {}
        range_t(double _from, double _to) {
            from = _from; to = _to;
        }
        
        range_t unsorted(double a, double b) {
            if (a < b) return range_t(a,b);
            else return range_t(b,a);
        }
        
        double toDouble() const { return ((from+to)/2.0); }
        float toFloat() const { return (float)toDouble(); }
        int toInt() const { return (int)toDouble(); }
        
        range_t add(const range_t& other) {
            return range_t( from+other.from, to+other.to );
        }
        
        range_t multiply(const range_t& other) {
            return unsorted( from*other.from, to*other.to );
        }
        
        range_t sine() {
            // TODO: this is not correct, fix it:
            return unsorted( sin(from), sin(to) );
        }
        
        range_t cosine() {
            // TODO: this is not correct, fix it:
            return unsorted( cos(from), cos(to) );
        }
        
        static range_t zero() { return range_t(0,0); }
        
        static range_t index_within_count(int index, int count) {
            return range_t( ((double)index) / ((double)count), ((double)(index+1)) / ((double)count) );
        }
        
        static range_t index(int index) { return range_t((double)index,(double)(index+1)); }
        
        static range_t infinity() { return range_t( -INFINITY, INFINITY ); }
    };
    
    typedef range_t rangef_t;
    
    struct expression_tree_t {
        wchar_t* name;
        wchar_t operation;
        rangef_t range;
        size_t index;
        expression_tree_t** expressions;
        size_t expression_count;
        size_t tree_size;
        
        static const wchar_t operation_immediate = 'i';
        static const wchar_t operation_read = 'r';
        static const wchar_t operation_add = '+';
        static const wchar_t operation_multiply = '*';
        static const wchar_t operation_sine = 's';
        static const wchar_t operation_cosine = 'c';
    };
    
    struct hyperfacet_packing_t {
        size_t pack_div;
        size_t pack_mod;
        size_t pack_offset;
        
        size_t data_from_vector_index(size_t vector_index) {
            return ( ( vector_index / pack_div ) % pack_mod ) + pack_offset;
        }
        
        static hyperfacet_packing_t zero() {
            hyperfacet_packing_t ans;
            ans.pack_div = 0;
            ans.pack_mod = 0;
            ans.pack_offset = 0;
            return ans;
        }
    };
    
    struct hyperfacet_t {
        // value range:
        range_t range;
        
        // array packing:
        size_t appends;
        size_t repeats;
        hyperfacet_packing_t packing_cached;
        
        // expression evaulation:
        const wchar_t* name;
        expression_tree_t* expression;
    };
    
    struct hypershape_t {
        hyperfacet_t** facets;
        int facet_count;
        int vector_count_cached;
        int data_count_cached;
        
        void update_cached() {
            vector_count_update();
            data_count_update();
            packing_update();
        }
        
        int data_count_update() {
            int result = 0;
            for (auto fi=0; fi<facet_count; fi++) {
                auto facet = facets[fi];
                if (facet->appends) {
                    result += facet->appends;
                }
                if (facet->repeats) {
                    result *= facet->repeats;
                }
            }
            data_count_cached = result;
            return result;
        }
        
        int vector_count_update() {
            int result = 1;
            for (auto fi=0; fi<facet_count; fi++) {
                auto facet = facets[fi];
                if (facet->repeats != 0) {
                    result *= facet->repeats;
                }
            }
            vector_count_cached = result;
            return result;
        }
        
        void packing_update() {
            hyperfacet_packing_t pack;
            pack.pack_div = 1;
            pack.pack_mod = 1;
            pack.pack_offset = 0;
            for (auto fi=0; fi<facet_count; fi++) {
                auto facet = facets[fi];
                
                if (facet->appends) {
                    pack.pack_mod = facet->appends;
                    facet->packing_cached = pack;
                    pack.pack_offset += facet->appends;
                    pack.pack_div *= facet->appends;
                    
                } else if (facet->repeats) {
                    pack.pack_mod = facet->repeats;
                    pack.pack_offset = 0;
                    facet->packing_cached = pack;
                    pack.pack_div *= facet->repeats;
                    
                } else {
                    facet->packing_cached = hyperfacet_packing_t::zero();
                }
            }
        }
    };
    
    struct hypershaped_vector_t {
        hypershape_t*    shape;
        range_t*    ranges;
        int         range_count;
        
        void bounds() {
            assert( range_count == shape->facet_count );
            for (auto fi=0; fi<shape->facet_count; fi++) {
                auto facet = shape->facets[fi];
                ranges[ fi ] = facet->range;
            }
        }
    };
    
    struct hypershaped_data_t {
        typedef range_t (*range_by_data_index_reader)(void* ptr, size_t data_index);
        typedef void (*range_by_data_index_writer)(void* ptr, size_t data_index, range_t val);
        
        hypershape_t*    shape;
        void*       data;
        size_t      debug_data_count;
        size_t      debug_data_size;
        range_by_data_index_reader range_by_data_index_read;
        range_by_data_index_writer range_by_data_index_write;
        
        
        void vector_by_index_read(hypershaped_vector_t* vector, int vector_index) {
            assert( vector->shape == shape );
            
            for (auto fi=0; fi<shape->facet_count; fi++) {
                auto facet = shape->facets[fi];
                auto r = facet->range;
                if (facet->appends) {
                    auto data_index = facet->packing_cached.data_from_vector_index( vector_index );
                    r = range_by_data_index_read( data, data_index );
                } else if (facet->repeats) {
                    r = facet->range.indexed_by_count( vector_index, shape->vector_count_cached );
                } else if (facet->expression) {
                    r = evaluate_expression( facet->expression, vector );
                } else {
                    r = facet->range;
                }
                vector->ranges[fi] = r;
            }
        }
        
        rangef_t evaluate_expression(expression_tree_t* expression, hypershaped_vector_t* vector) const {
            switch ( expression->operation ) {
                case expression_tree_t::operation_immediate:
                    return expression->range; // immediate value
                case expression_tree_t::operation_read:
                    return vector->ranges[ expression->index ]; // read value
                case expression_tree_t::operation_add: {
                    rangef_t result = rangef_t::zero();
                    for (auto ei=0; ei<expression->expression_count; ei++) {
                        auto val = evaluate_expression( expression->expressions[ei], vector );
                        result = result.add( val );
                    }
                    return result;
                }
                case expression_tree_t::operation_multiply: {
                    rangef_t result = rangef_t::zero();
                    for (auto ei=0; ei<expression->expression_count; ei++) {
                        auto val = evaluate_expression( expression->expressions[ei], vector );
                        if (ei==0) {
                            result = val;
                        } else {
                            result = result.multiply( val );
                        }
                    }
                    return result;
                }
                case expression_tree_t::operation_sine : {
                        auto val = evaluate_expression( expression->expressions[0], vector );
                        val = val.sine();
                        return val;
                    }
                case expression_tree_t::operation_cosine : {
                    auto val = evaluate_expression( expression->expressions[0], vector );
                    val = val.cosine();
                    return val;
                }
                default:
                    throw "Unknown operation";
            }
        }
        
        void vector_by_index_write(hypershaped_vector_t* vector, int vector_index) {
            for (auto fi=0; fi<shape->facet_count; fi++) {
                auto facet = shape->facets[fi];
                if (facet->appends) {
                    auto data_index = facet->packing_cached.data_from_vector_index( vector_index );
                    
                    auto r = vector->ranges[fi];
                    range_by_data_index_write( data, data_index, r );
                }
            }
        }
        
    private:
        
        template <typename T> class array_of_typed_int_methods {
        public:
            
            static hypershaped_data_t shaped_array(hypershape_t* pShape, T* pData, size_t count) {
                hypershaped_data_t buffer;
                buffer.shape = pShape;
                buffer.data = (void*)pData;
                buffer.debug_data_count = count;
                buffer.debug_data_size = sizeof(T) * count;
                buffer.range_by_data_index_read = range_from_typed_array_read;
                buffer.range_by_data_index_write = range_from_typed_array_write;
                return buffer;
            }
            
            static range_t range_from_typed_array_read(void* ptr, size_t index) {
                T val = ((T*)ptr)[ index ];
                return range_t::index( val );
            }
            
            static void range_from_typed_array_write(void* ptr, size_t index, range_t val) {
                ((T*)ptr)[ index ] = (T)( val.toInt() );
            }
        };
        
        template <typename T> class array_of_typed_float_methods {
        public:
            
            static hypershaped_data_t shaped_array(hypershape_t* pShape, T* pData, size_t count) {
                hypershaped_data_t buffer;
                buffer.shape = pShape;
                buffer.data = (void*)pData;
                buffer.debug_data_count = count;
                buffer.debug_data_size = sizeof(T) * count;
                buffer.range_by_data_index_read = range_from_typed_array_read;
                buffer.range_by_data_index_write = range_from_typed_array_write;
                return buffer;
            }
            
            static range_t range_from_typed_array_read(void* ptr, size_t index) {
                wchar_t val = ((T*)ptr)[ index ];
                return range_t( val, val );
            }
            
            static void range_from_typed_array_write(void* ptr, size_t index, range_t val) {
                ((T*)ptr)[ index ] = val.toFloat();
            }
        };
        
    public:
        
        static hypershaped_data_t shaped_float_array(hypershape_t* pShape, float* pData, size_t count) {
            return array_of_typed_float_methods<float>::shaped_array( pShape, pData, count );
        }
        
        static hypershaped_data_t shaped_int_array(hypershape_t* pShape, int* pData, size_t count) {
            return array_of_typed_int_methods<int>::shaped_array( pShape, pData, count );
        }
    
        static hypershaped_data_t shaped_wchar_array(hypershape_t* pShape, wchar_t* pData, size_t count) {
            return array_of_typed_int_methods<wchar_t>::shaped_array( pShape, pData, count );
        }
        
    };
    
    struct hypermemory_t {
        typedef void* (*method_allocate)(size_t size);
        typedef void (*method_free)(void* ptr);
        typedef void (*method_zero_memory)(void* ptr, size_t size);
        
        method_allocate     memory_allocate;
        method_free         memory_free;
        method_zero_memory  memory_zero;
        
        
        hypershape_t* allocate_shape(size_t count_facets) {
            const size_t sizes[3] = {
                sizeof( hypershape_t ),
                ( sizeof(hyperfacet_t*) * count_facets ),
                sizeof(hyperfacet_t)
            };
            const size_t totalSize = sizes[0] + sizes[1] + ( sizes[2] * count_facets );
            void* pMemory = memory_allocate( totalSize );
            memory_zero( pMemory, totalSize );
            void* pEnd = offset_by( pMemory, totalSize );
            
            hypershape_t* shape = (hypershape_t*)pMemory;
            pMemory = offset_by(pMemory, sizes[0] );
            
            shape->facets = (hyperfacet_t**)pMemory;
            shape->facet_count = count_facets;
            pMemory = offset_by(pMemory, sizes[1] );
            
            for (auto i=0; i<count_facets; i++) {
                shape->facets[i] = (hyperfacet_t*)pMemory;
                pMemory = offset_by(pMemory, sizes[2] );
            }
            assert( pMemory == pEnd );
            
            return shape;
        }
        
        void free_shape(hypershape_t* shape) {
            memory_free( shape );
        }
        
        hypershaped_vector_t* allocate_shaped_vector(hypershape_t* shape) {
            const auto count_ranges = shape->facet_count;
            const size_t sizes[2] = {
                sizeof( hypershaped_vector_t ),
                ( sizeof(range_t*) * count_ranges ),
            };
            const size_t totalSize = sizes[0] + sizes[1];
            void* pMemory = memory_allocate( totalSize );
            memory_zero( pMemory, totalSize );
            void* pEnd = offset_by( pMemory, totalSize );
            
            auto* vector = (hypershaped_vector_t*)pMemory;
            vector->shape = shape;
            pMemory = offset_by(pMemory, sizes[0] );
            
            vector->ranges = (range_t*)pMemory;
            vector->range_count = count_ranges;
            pMemory = offset_by(pMemory, sizes[1] );
            
            assert( pMemory == pEnd );
            
            return vector;
        }
        
        void free_vector(hypershaped_vector_t* vector) {
            memory_free( vector );
        }
        
        
        static hypermemory_t standard() {
            hypermemory_t ans;
            ans.memory_allocate = standard_allocate;
            ans.memory_free = standard_free;
            ans.memory_zero = standard_memclear;
            return ans;
        }
        
    private:
        static void* offset_by(void* ptr, size_t size) {
            uint8_t* as_bytes = (uint8_t*)ptr;
            as_bytes += size;
            return as_bytes;
        }
        
        static void* standard_allocate(size_t size) {
            return malloc( size );
        }
        
        static void standard_free(void* ptr) {
            return free( ptr );
        }
        
        static void standard_memclear(void* ptr, size_t size) {
            // TODO: use system zero method
            for (auto i=0; i<size; i++) {
                ((uint8_t*)ptr)[i] = 0;
            }
        }
    };
    
#ifdef string3_h
    
    struct string3_hypershape_ptr {
        lewdo::string3_ptr      str3;
        hypershape_t*           shape;
        hypershaped_vector_t*   bounds;
        hypershaped_data_t      data;
        
        static string3_hypershape_ptr allocate(lewdo::string3_ptr _str3) {
            string3_hypershape_ptr ans;
            ans.str3 = _str3;
            auto memory_system = hypermemory_t::standard();
            
            const int n = 4;
            ans.shape = memory_system.allocate_shape(n);
            ans.shape->facets[0]->name = L"letter";
            ans.shape->facets[0]->appends = 1;
            ans.shape->facets[0]->range = rangef_t( 0, 256 );
            ans.shape->facets[1]->name = L"x";
            ans.shape->facets[1]->repeats = _str3.size.v[0];
            ans.shape->facets[2]->name = L"y";
            ans.shape->facets[2]->repeats = _str3.size.v[1];
            ans.shape->facets[3]->name = L"z";
            ans.shape->facets[3]->repeats = _str3.size.v[2];
            for (auto i=1; i<n; i++) {
                auto facet = ans.shape->facets[i];
                facet->range = range_t( 0, facet->repeats );
            }
            ans.shape->update_cached();
            
            ans.bounds= memory_system.allocate_shaped_vector( ans.shape );
            ans.bounds->bounds();
            
            ans.data = hypershaped_data_t::shaped_wchar_array( ans.shape, _str3.array1d, _str3.size.count() );
            
            return ans;
        }
        
        void free() {
            auto memory_system = hypermemory_t::standard();
            memory_system.free_vector(bounds);
            memory_system.free_shape(shape);
        }
    };
    
#endif
    
};

#endif /* hyperspace_h */

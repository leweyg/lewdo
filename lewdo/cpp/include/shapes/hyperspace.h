//
//  hyperspace.h
//  lewdo_native
//
//  Created by Lewey Geselowitz on 10/6/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef hyperspace_h
#define hyperspace_h

#include <map>

namespace lewdo_shapes_hyperspace {
    
    // TODO: replace with boost::interval<double>
    struct ranged_t {
        double from;
        double to;
        
        ranged_t indexed_by_count(size_t index, size_t count) const {
            double step = (to - from) / ((double)count);
            ranged_t ans((from + (step * ((double)(index+0) ))) ,
                        (from + (step * ((double)(index+1)))));
             return ans;
        }
        
        ranged_t() {}
        ranged_t(double _from, double _to) {
            from = _from; to = _to;
        }
        
        ranged_t unsorted(double a, double b) {
            if (a < b) return ranged_t(a,b);
            else return ranged_t(b,a);
        }
        
        double toDouble() const { return ((from+to)/2.0); }
        float toFloat() const { return (float)toDouble(); }
        int toInt() const { return (int)toDouble(); }
        
        ranged_t add(const ranged_t& other) {
            return ranged_t( from+other.from, to+other.to );
        }
        
        ranged_t multiply(const ranged_t& other) {
            return unsorted( from*other.from, to*other.to );
        }
        
        ranged_t sine() {
            // TODO: this is not correct, fix it:
            return unsorted( sin(from), sin(to) );
        }
        
        ranged_t cosine() {
            // TODO: this is not correct, fix it:
            return unsorted( cos(from), cos(to) );
        }
        
        static ranged_t zero() { return ranged_t(0,0); }
        
        static ranged_t index_within_count(int index, int count) {
            return ranged_t( ((double)index) / ((double)count), ((double)(index+1)) / ((double)count) );
        }
        
        static ranged_t index(int index) { return ranged_t((double)index,(double)(index+1)); }
        
        static ranged_t infinity() { return ranged_t( -INFINITY, INFINITY ); }
    };
    
    struct hyperfacet_expression_tree_t {
        wchar_t operation;
        ranged_t range;
        size_t index;
        wchar_t* name;
        hyperfacet_expression_tree_t** expressions;
        size_t expression_count;
        size_t tree_size;
        
        static const wchar_t operation_immediate = 'i';
        static const wchar_t operation_read = 'r';
        static const wchar_t operation_add = '+';
        static const wchar_t operation_multiply = '*';
        static const wchar_t operation_sine = 's';
        static const wchar_t operation_cosine = 'c';
        
        static hyperfacet_expression_tree_t* allocate_standard(size_t tree_size);
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
        ranged_t range;
        
        // array packing:
        size_t appends;
        size_t repeats;
        hyperfacet_packing_t packing_cached;
        
        // expression evaulation:
        const wchar_t* name;
        hyperfacet_expression_tree_t* expression;
        size_t facet_index_cached;
    };
    
    struct hypershape_t {
        hyperfacet_t** facets;
        size_t facet_count;
        size_t vector_count_cached;
        size_t data_count_cached;
        
        static hypershape_t* allocate_standard(size_t count_facets);
        
        void update_cached() {
            vector_count_update();
            data_count_update();
            packing_update();
        }
        
        size_t data_count_update() {
            size_t result = 0;
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
        
        size_t vector_count_update() {
            size_t result = 1;
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
            bool isFirstDiv = true;
            for (auto fi=0; fi<facet_count; fi++) {
                auto facet = facets[fi];
                facet->facet_index_cached = fi;
                
                if (facet->appends) {
                    pack.pack_mod = facet->appends;
                    facet->packing_cached = pack;
                    pack.pack_offset += facet->appends;
                    if (isFirstDiv) {
                        pack.pack_div = facet->appends;
                    } else {
                        pack.pack_div += facet->appends;
                    }
                    isFirstDiv = false;
                    
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
    
    struct hypershaped_vector_ptr {
        hypershape_t*    shape;
        ranged_t*    ranges;
        size_t      range_count;
        
        static hypershaped_vector_ptr allocate_standard(hypershape_t* shape);
        
        void bounds() {
            assert( range_count == shape->facet_count );
            for (auto fi=0; fi<shape->facet_count; fi++) {
                auto facet = shape->facets[fi];
                ranges[ fi ] = facet->range;
            }
        }
    };
    
    struct hypertransform_ptr {
        hypershape_t*    plan;
        hypershape_t*    from;
        hypershape_t*    to;
        
        static hypertransform_ptr fromShapeToShape(hypershape_t* pFrom, hypershape_t* pTo) {
            hypertransform_ptr ans;
            ans.configure(pFrom,pTo);
            return ans;
        }
        
        struct compareWCharStrings {
            bool operator()(const wchar_t* pA, const wchar_t* pB) const {
                return (wcscmp(pA, pB) == 0);
            }
        };
        
        void configure(hypershape_t* pFrom, hypershape_t* pTo) {
            from = pFrom;
            to = pTo;
            
            struct facet_from_to{
                const hyperfacet_t* from;
                const hyperfacet_t* to;
                
                facet_from_to() {}
                facet_from_to(const hyperfacet_t* _from) {from=_from; to=_from;}
                facet_from_to(const hyperfacet_t* _from, const hyperfacet_t* _to) {from=_from; to=_to;}
            };
            
            std::map<const wchar_t*,facet_from_to,compareWCharStrings> nameToIndex;
            std::string str;
            for (size_t i=0; i<pTo->facet_count; i++) {
                auto facet = pTo->facets[i];
                auto stringName = facet->name;
                nameToIndex.insert( { stringName, facet_from_to(facet) } );
            }
            for (size_t i=0; i<pFrom->facet_count; i++) {
                auto facet = pFrom->facets[i];
                auto stringName = facet->name;
                auto already = nameToIndex.find( stringName );
                if (already != nameToIndex.end()) {
                    nameToIndex.at( stringName ) = facet_from_to( already->second.from, facet );
                    // already in there, will need transform
                } else {
                    nameToIndex.insert( { stringName, facet_from_to( nullptr, facet ) } );
                }
            }
            
            size_t count_facets = nameToIndex.size();
            plan = hypershape_t::allocate_standard(count_facets);
            size_t result_index = 0;
            for (auto facetMapIter=nameToIndex.begin(); facetMapIter!=nameToIndex.end(); facetMapIter++, result_index++ ) {
                auto facetFromTo = facetMapIter->second;
                auto into = plan->facets[ result_index ];
                if (facetFromTo.from == nullptr) {
                    assert( facetFromTo.to );
                    into->name = facetFromTo.to->name;
                    into->range = facetFromTo.to->range;
                    into->expression = hyperfacet_expression_tree_t::allocate_standard(1);
                    into->expression->operation = into->expression->operation_read;
                    into->expression->index = facetFromTo.to->facet_index_cached;
                    into->expression->range = facetFromTo.to->range;
                } else if (facetFromTo.to == nullptr) {
                    *into = *facetFromTo.from;
                } else {
                    // both from and to facets are defined...
                    // TODO continue here...
                }
            }
            plan->update_cached();
        }
    };
    
    struct hypershaped_data_ptr {
        typedef ranged_t (*range_by_data_index_reader)(void* ptr, size_t data_index);
        typedef void (*range_by_data_index_writer)(void* ptr, size_t data_index, ranged_t val);
        
        hypershape_t*    shape;
        void*       data;
        size_t      debug_data_count;
        size_t      debug_data_size;
        range_by_data_index_reader range_by_data_index_read;
        range_by_data_index_writer range_by_data_index_write;
        
        bool is_valid() const { return (data!=nullptr); }
        
        
        void vector_by_index_read(hypershaped_vector_ptr* vector, int vector_index) {
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
        
        ranged_t evaluate_expression(hyperfacet_expression_tree_t* expression, hypershaped_vector_ptr* vector) const {
            switch ( expression->operation ) {
                case hyperfacet_expression_tree_t::operation_immediate:
                    return expression->range; // immediate value
                case hyperfacet_expression_tree_t::operation_read:
                    return vector->ranges[ expression->index ]; // read value
                case hyperfacet_expression_tree_t::operation_add: {
                    ranged_t result = ranged_t::zero();
                    for (auto ei=0; ei<expression->expression_count; ei++) {
                        auto val = evaluate_expression( expression->expressions[ei], vector );
                        result = result.add( val );
                    }
                    return result;
                }
                case hyperfacet_expression_tree_t::operation_multiply: {
                    ranged_t result = ranged_t::zero();
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
                case hyperfacet_expression_tree_t::operation_sine : {
                        auto val = evaluate_expression( expression->expressions[0], vector );
                        val = val.sine();
                        return val;
                    }
                case hyperfacet_expression_tree_t::operation_cosine : {
                    auto val = evaluate_expression( expression->expressions[0], vector );
                    val = val.cosine();
                    return val;
                }
                default:
                    throw "Unknown operation";
            }
        }
        
        void vector_by_index_write(hypershaped_vector_ptr* vector, int vector_index) {
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
            
            static hypershaped_data_ptr shaped_array(hypershape_t* pShape, T* pData, size_t count) {
                hypershaped_data_ptr buffer;
                buffer.shape = pShape;
                buffer.data = (void*)pData;
                buffer.debug_data_count = count;
                buffer.debug_data_size = sizeof(T) * count;
                buffer.range_by_data_index_read = range_from_typed_array_read;
                buffer.range_by_data_index_write = range_from_typed_array_write;
                return buffer;
            }
            
            static ranged_t range_from_typed_array_read(void* ptr, size_t index) {
                T val = ((T*)ptr)[ index ];
                return ranged_t::index( val );
            }
            
            static void range_from_typed_array_write(void* ptr, size_t index, ranged_t val) {
                ((T*)ptr)[ index ] = (T)( val.toInt() );
            }
        };
        
        template <typename T> class array_of_typed_float_methods {
        public:
            
            static hypershaped_data_ptr shaped_array(hypershape_t* pShape, T* pData, size_t count) {
                hypershaped_data_ptr buffer;
                buffer.shape = pShape;
                buffer.data = (void*)pData;
                buffer.debug_data_count = count;
                buffer.debug_data_size = sizeof(T) * count;
                buffer.range_by_data_index_read = range_from_typed_array_read;
                buffer.range_by_data_index_write = range_from_typed_array_write;
                return buffer;
            }
            
            static ranged_t range_from_typed_array_read(void* ptr, size_t index) {
                wchar_t val = ((T*)ptr)[ index ];
                return ranged_t( val, val );
            }
            
            static void range_from_typed_array_write(void* ptr, size_t index, ranged_t val) {
                ((T*)ptr)[ index ] = val.toFloat();
            }
        };
        
    public:
        
        static hypershaped_data_ptr shaped_float_array(hypershape_t* pShape, float* pData, size_t count) {
            return array_of_typed_float_methods<float>::shaped_array( pShape, pData, count );
        }
        
        static hypershaped_data_ptr shaped_int_array(hypershape_t* pShape, int* pData, size_t count) {
            return array_of_typed_int_methods<int>::shaped_array( pShape, pData, count );
        }
    
        static hypershaped_data_ptr shaped_wchar_array(hypershape_t* pShape, wchar_t* pData, size_t count) {
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
            memory_free( shape->facets );
        }
        
        hypershaped_vector_ptr allocate_shaped_vector(hypershape_t* shape) {
            const size_t count_ranges = shape->facet_count;
            
            hypershaped_vector_ptr vector;
            vector.shape = shape;
            vector.ranges = (ranged_t*)memory_allocate( sizeof(ranged_t) * count_ranges );
            vector.range_count = count_ranges;
            
            return vector;
        }
        
        void free_vector(hypershaped_vector_ptr& vector) {
            memory_free( vector.ranges );
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
            free( ptr );
        }
        
        static void standard_memclear(void* ptr, size_t size) {
            // TODO: use system zero method
            for (auto i=0; i<size; i++) {
                ((uint8_t*)ptr)[i] = 0;
            }
        }
    };
    
    hypershape_t* hypershape_t::allocate_standard(size_t count_facets) {
        return hypermemory_t::standard().allocate_shape(count_facets);
    }
    
    hypershaped_vector_ptr hypershaped_vector_ptr::allocate_standard(hypershape_t* shape) {
        return hypermemory_t::standard().allocate_shaped_vector(shape);
    }
    
    hyperfacet_expression_tree_t* hyperfacet_expression_tree_t::allocate_standard(size_t tree_size) {
        size_t full_size = tree_size * sizeof(hyperfacet_expression_tree_t);
        void* ptr = hypermemory_t::standard().memory_allocate( full_size );
        hypermemory_t::standard().memory_zero( ptr, full_size );
        auto pTree = (hyperfacet_expression_tree_t*)ptr;
        pTree->tree_size = tree_size;
        return pTree;
    }
    
#ifdef string3_h
    
    struct string3_hypershape_ptr {
        lewdo::string3_ptr      str3;
        hypershape_t*           shape;
        hypershaped_vector_ptr    bounds;
        hypershaped_data_ptr      data;
        
        static string3_hypershape_ptr allocate(lewdo::string3_ptr _str3) {
            string3_hypershape_ptr ans;
            
            auto memory_system = hypermemory_t::standard();
            
            memory_system.memory_zero( &ans, sizeof(ans) );
            ans.str3 = _str3;
            
            const int n = 4;
            ans.shape = memory_system.allocate_shape(n);
            ans.shape->facets[0]->name = L"letter";
            ans.shape->facets[0]->appends = 1;
            ans.shape->facets[0]->range = ranged_t( 0, 256 );
            ans.shape->facets[1]->name = L"x";
            ans.shape->facets[1]->repeats = _str3.size.v[0];
            ans.shape->facets[2]->name = L"y";
            ans.shape->facets[2]->repeats = _str3.size.v[1];
            ans.shape->facets[3]->name = L"z";
            ans.shape->facets[3]->repeats = _str3.size.v[2];
            for (auto i=1; i<n; i++) { // starting at 1 instead of 0
                auto facet = ans.shape->facets[i];
                facet->range = ranged_t( 0, facet->repeats );
            }
            ans.shape->update_cached();
            
            ans.bounds = memory_system.allocate_shaped_vector( ans.shape );
            ans.bounds.bounds();
            
            ans.data = hypershaped_data_ptr::shaped_wchar_array( ans.shape,
                                                              _str3.array1d,
                                                              _str3.size.count() );
            
            return ans;
        }
        
        void free_bounds_and_shape() {
            auto memory_system = hypermemory_t::standard();
            memory_system.free_vector(bounds);
            memory_system.free_shape(shape); shape = nullptr;
        }
    };
    
#endif
    
};

#endif /* hyperspace_h */

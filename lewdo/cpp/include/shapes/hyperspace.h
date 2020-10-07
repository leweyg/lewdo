//
//  hyperspace.h
//  lewdo_native
//
//  Created by Lewey Geselowitz on 10/6/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef hyperspace_h
#define hyperspace_h

namespace lewdo::hyperspace {
    
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
    
    struct facet_packing_t {
        int pack_div;
        int pack_mod;
        int pack_offset;
        
        int data_from_vector_index(int vector_index) {
            return ( ( vector_index / pack_div ) % pack_mod ) + pack_offset;
        }
        
        static facet_packing_t zero() {
            facet_packing_t ans;
            ans.pack_div = 0;
            ans.pack_mod = 0;
            ans.pack_offset = 0;
            return ans;
        }
    };
    
    struct facet_t {
        // value range:
        range_t range;
        
        // array packing:
        int appends;
        int repeats;
        facet_packing_t packing_cached;
        
        // expression evaulation:
        wchar_t* name;
        expression_tree_t* expression;
        
        // runtime compiled values:
        void* compiled;
    };
    
    struct shape_t {
        facet_t** facets;
        int facet_count;
        int vector_count_cached;
        int data_count_cached;
        
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
            facet_packing_t pack;
            pack.pack_div = 1;
            pack.pack_mod = 1;
            pack.pack_offset = 0;
            for (auto fi=0; fi<facet_count; fi++) {
                auto facet = facets[fi];
                
                if (facet->appends) {
                    pack.pack_mod = facet->appends;
                    pack.pack_offset += facet->appends;
                    facet->packing_cached = pack;
                    pack.pack_div *= facet->appends;
                    
                } else if (facet->repeats) {
                    pack.pack_mod = facet->repeats;
                    pack.pack_offset = 0;
                    facet->packing_cached = pack;
                    pack.pack_div *= facet->repeats;
                    
                } else {
                    facet->packing_cached = facet_packing_t::zero();
                }
            }
        }
    };
    
    struct shaped_vector_t {
        shape_t*    shape;
        range_t*    ranges;
        int         size;
        
        void bounds() {
            assert( size == shape->facet_count );
            for (auto fi=0; fi<shape->facet_count; fi++) {
                auto facet = shape->facets[fi];
                ranges[ fi ] = facet->range;
            }
        }
    };
    
    typedef range_t (*range_by_data_index_reader)(void* ptr, size_t data_index);
    typedef void (*range_by_data_index_writer)(void* ptr, size_t data_index, range_t val);
    
    struct shaped_data_t {
        shape_t*    shape;
        void*       data;
        size_t      debug_data_count;
        size_t      debug_data_size;
        range_by_data_index_reader range_by_data_index_read;
        range_by_data_index_writer range_by_data_index_write;
        
        
        void vector_by_index_read(shaped_vector_t* vector, int vector_index) {
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
        
        rangef_t evaluate_expression(expression_tree_t* expression, shaped_vector_t* vector) const {
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
        
        void vector_by_index_write(shaped_vector_t* vector, int vector_index) {
            for (auto fi=0; fi<shape->facet_count; fi++) {
                auto facet = shape->facets[fi];
                if (facet->appends) {
                    auto data_index = facet->packing_cached.data_from_vector_index( vector_index );
                    
                    auto r = vector->ranges[fi];
                    range_by_data_index_write( data, data_index, r );
                }
            }
        }
        
        static shaped_data_t shaped_float_array(shape_t* pShape, float* pData, size_t count) {
            shaped_data_t buffer;
            buffer.shape = pShape;
            buffer.data = pData;
            buffer.debug_data_count = count;
            buffer.debug_data_size = sizeof(float) * count;
            buffer.range_by_data_index_read = range_from_float_array_read;
            buffer.range_by_data_index_write = range_from_float_array_write;
            return buffer;
        }
    
        static shaped_data_t shaped_wchar_array(shape_t* pShape, wchar_t* pData, size_t count) {
            shaped_data_t buffer;
            buffer.shape = pShape;
            buffer.data = pData;
            buffer.debug_data_count = count;
            buffer.debug_data_size = sizeof(wchar_t) * count;
            buffer.range_by_data_index_read = range_from_wchar_array_read;
            buffer.range_by_data_index_write = range_from_wchar_array_write;
            return buffer;
        }
        
    private:
        
        static range_t range_from_float_array_read(void* ptr, size_t index) {
            float val = ((float*)ptr)[ index ];
            return range_t( val, val );
        }
        
        static void range_from_float_array_write(void* ptr, size_t index, range_t val) {
            ((float*)ptr)[ index ] = val.toFloat();
        }
        
        static range_t range_from_wchar_array_read(void* ptr, size_t index) {
            wchar_t val = ((wchar_t*)ptr)[ index ];
            return range_t::index( val );
        }
        
        static void range_from_wchar_array_write(void* ptr, size_t index, range_t val) {
            ((wchar_t*)ptr)[ index ] = (wchar_t)( val.toInt() );
        }
    };
    
    struct space_t {
        space_t*        context;
        shape_t         transform;
        shaped_data_t   raster;
    };
    
};

#endif /* hyperspace_h */

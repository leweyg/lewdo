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
        
        range_t indexed_by_count(int index, int count) {
            double step = (to - from) / ((double)count);
            range_t ans((from + (step * ((double)(index+0) ))) ,
                        (from + (step * ((double)(index+1)))));
             return ans;
        }
        
        range_t() {}
        range_t(double _from, double _to) {
            from = _from; to = _to;
        }
    };
    
    struct expression_tree_t {
        wchar_t* name;
        double scalar;
        expression_tree_t** args;
        size_t tree_size;
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
    
    typedef range_t (*read_range_by_data_index)(void* ptr, size_t data_index);
    
    struct shaped_data_t {
        shape_t*    shape;
        void*       data;
        size_t      count;
        size_t      size;
        read_range_by_data_index range_by_data_index;
        
        void vector_by_index(shaped_vector_t* vector, int vector_index) {
            assert( vector->shape == shape );
            
            for (auto fi=0; fi<shape->facet_count; fi++) {
                auto facet = shape->facets[fi];
                auto r = facet->range;
                if (facet->appends) {
                    auto data_index = facet->packing_cached.data_from_vector_index( vector_index );
                    r = range_by_data_index( data, data_index );
                } else if (facet->repeats) {
                    r = facet->range.indexed_by_count( vector_index, shape->vector_count_cached );
                } else {
                    r = facet->range;
                }
                vector->ranges[fi] = r;
            }
        }
        
        static shaped_data_t shaped_float_array(shape_t* pShape, float* pData, size_t count) {
            shaped_data_t buffer;
            buffer.shape = pShape;
            buffer.data = pData;
            buffer.count = count;
            buffer.size = sizeof(float) * count;
            buffer.range_by_data_index = range_from_float_array;
            return buffer;
        }
        
        static range_t range_from_float_array(void* ptr, size_t index) {
            float val = ((float*)ptr)[ index ];
            return range_t( val, val );
        }
    };
    
    struct space_t {
        space_t*        context;
        shape_t         transform;
        shaped_data_t   raster;
    };
    
};

#endif /* hyperspace_h */

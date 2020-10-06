//
//  math3_t.h
//  lewdo_native
//
//  Created by Lewey Geselowitz on 10/5/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef math3_t_h
#define math3_t_h

#include "size3_t.h"

namespace lewdo {
    
    class float3_t : public tensorN_T<3,float> {
    public:
        static const float3_t zero;
        static const float3_t one;
        
        float3_t() {}
        float3_t(const size3_t& other) {
            EXPAND3_i( v[i]=other.v[i] );
        };
        
        float3_t(float _x, float _y, float _z) {
            v[0] = _x;
            v[1] = _y;
            v[2] = _z;
        };
        
        float dot(const float3_t& other) const {
            float result = 0;
            EXPAND3_i( result += ( v[i] * other.v[i] ) );
            return result;
        };
        
        float3_t add(const float3_t& other) const {
            float3_t result;
            EXPAND3_i( result.v[i] = ( v[i] + other.v[i] ) );
            return result;
        };
        
        float3_t max(const float3_t& other) const {
            float3_t result;
            EXPAND3_i( result.v[i] = ((v[i]>other.v[i])?v[i]:other.v[i]) );
            return result;
        };
        
    };
    
    const float3_t float3_t::zero(0,0,0);
    const float3_t float3_t::one (1,1,1);
    
    static_assert( sizeof(float3_t) == (3*sizeof(float)), "check float3_t is exactly 3 float(s).");

    
};

#endif /* math3_t_h */

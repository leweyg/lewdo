//
//  size3_t.h
//
//  Created by Lewey Geselowitz on 9/29/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef size3_t_h
#define size3_t_h

template <typename T,size_t N>
class tensorN_t {
    
public:
    T v[N];
    
    static const size_t dimensions = N;
    
    tensorN_t() { }
};

#define EXPAND3_i(foo) {const size_t i=0;foo;}{const size_t i=1;foo;}{const size_t i=2;foo;}

size_t add_size_t(size_t a, size_t b) {
    return (a + b);
}

class size3_t : public tensorN_t<size_t,3>
{
public:
    static const size_t N = 3;
    static const size3_t zero;
    static const size3_t one;
    
    size3_t() {}
    
    size3_t(const size3_t& other) {
        EXPAND3_i( v[i]=other.v[i] );
    };
    
    size3_t(size_t _x, size_t _y, size_t _z) {
        v[0] = _x;
        v[1] = _y;
        v[2] = _z;
    };
    
    bool const isValidIndex(size3_t other) {
        bool isValid = true;
        EXPAND3_i( isValid = isValid && (other.v[i] >= 0) && ( other.v[i] < v[i] ) );
        return isValid;
    }
    
    size_t product() {
        size_t prod = 1;
        EXPAND3_i( prod *= v[i] );
        return prod;
    }
    
    size3_t product(const size3_t& other) {
        size3_t result;
        EXPAND3_i( result.v[i] = ( v[i] * other.v[i] ) );
        return result;
    };
    
    size_t dot(const size3_t& other) const {
        size_t result = 0;
        EXPAND3_i( result += ( v[i] * other.v[i] ) );
        return result;
    };
    
    size3_t undot(size_t index) const {
        size3_t result;
        size_t div = 1;
        EXPAND3_i( result.v[i] = ((index/div)%(v[i])); div *= v[i]; );
        return result;
    }
    
    size3_t packing() const {
        size3_t result;
        size_t div = 1;
        EXPAND3_i( result.v[i] = div; div *= v[i]; );
        return result;
    };
    
    size_t const pack(size3_t pos) {
        return packing().dot( pos );
    };
    
    size3_t const unpack(size_t pos) {
        return packing().undot( pos );
    };
    
    size3_t add(const size3_t& other) {
        size3_t result;
        EXPAND3_i( result.v[i] = ( v[i] + other.v[i] ) );
        return result;
    };
    
    size3_t max(const size3_t& other) {
        size3_t result;
        EXPAND3_i( result.v[i] = ((v[i]>other.v[i])?v[i]:other.v[i]) );
        return result;
    };
    
};

const size3_t size3_t::zero(0,0,0);
const size3_t size3_t::one (1,1,1);

static_assert( sizeof(size3_t) == (3*sizeof(size_t)), "check size3_t is exactly 3 size_t's ");


#endif /* size3_t_h */
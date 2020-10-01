//
//  string3.h
//
//  Created by Lewey Geselowitz on 9/29/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef string3_h
#define string3_h

#include "size3_t.h"

template <typename T> class tensor3n_T_ptr {
public:
    size3_t size;
    T* array1d;
    
    tensor3n_T_ptr() {}
    
    tensor3n_T_ptr(const tensor3n_T_ptr& other) {
        size = other.size;
        array1d = other.array1d;
    }
    
    tensor3n_T_ptr(size3_t _size, T* _array1D) {
        size = _size;
        array1d = _array1D;
    }
    
    bool const isValidIndex(size3_t pos) {
        return size.isValidIndex(pos);
    }
    
    void Set(size3_t pos, T letter) {
        assert( isValidIndex(pos) );
        assert( size.pack(pos) < count() );
        array1d[ size.pack(pos) ] = letter;
    }
    
    T const Get(size3_t pos) {
        assert( isValidIndex(pos) );
        assert( size.pack(pos) < count() );
        return array1d[ size.pack(pos) ];
    }
    
    //unsigned long operator [](int i) const    {return registers[i];}
    //unsigned long & operator [](int i) {return registers[i];}
    
    const size_t count() {
        return size.product();
    }
    
    void Zero() {
        size = size3_t::zero;
        array1d = nullptr;
    }
    
    static T* NewArray(size_t _size) {
        auto pData = new T[ _size ];
        return pData;
    }
    
    static tensor3n_T_ptr NewTensor(size3_t _size) {
        return tensor3n_T_ptr( _size, NewArray( _size.product() ) );
    }
    
    void Delete() {
        delete [] array1d;
        Zero();
    }
    
    void Clear(T to) {
        auto n = count();
        for (auto i=0; i<n; i++) {
            array1d[i] = to;
        }
    }
};

class string3_ptr : public tensor3n_T_ptr<wchar_t> {
public:

    string3_ptr(size3_t _size, wchar_t* _array1D) : tensor3n_T_ptr(_size,_array1D) {
    }
    
    static string3_ptr New( size3_t _size ) {
        auto core = NewTensor( _size );
        auto result = string3_ptr( _size, core.array1d );
        return result;
    }
    
    static string3_ptr String(const wchar_t* pCString) {
        size3_t size = StringMeasure(pCString);
        auto result = New( size );
        result.Clear(L' ');
        
        size3_t cur = size3_t::zero;
        for (auto i=0; pCString[i] != 0; i++) {
            auto letter = pCString[i];
            if (!CharIsControl(letter)) {
                result.Set(cur, letter);
            }
            cur = StringStepPos( letter, cur );
        }
        
        return result;
    }
    
    static size3_t StringMeasure(const wchar_t* pCString) {
        if (!pCString || !*pCString) {
            return size3_t::zero;
        }
        size3_t max = size3_t::one;
        size3_t cur = size3_t::zero;
        for (auto i=0; pCString[i] != 0; i++) {
            auto letter = pCString[i];
            max = CharIsControl(letter) ? max : max.max(cur.add(size3_t::one));
            cur = StringStepPos( letter, cur );
        }
        return max;
    }
    
    static bool CharIsControl(wchar_t letter) {
        switch (letter) {
            case 0:
            case '\n':
            case '\v':
            case '\t':
                return true;
            default:
                return false;
        }
    }
    
    static size3_t StringStepPos(wchar_t letter, size3_t cur) {
        if (letter != 0) {
            if (letter == '\n') {
                cur.v[0] = 0;
                cur.v[1]++;
            } else if (letter == '\v') {
                cur.v[0] = 0;
                cur.v[1] = 0;
                cur.v[2]++;
            } else {
                cur.v[0]++;
            }
        }
        return cur;
    }
    
};


#endif /* string3_h */

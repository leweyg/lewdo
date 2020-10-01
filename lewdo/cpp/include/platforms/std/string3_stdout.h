//
//  string3_stdout.h
//
//  Created by Lewey Geselowitz on 9/30/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef string3_stdout_h
#define string3_stdout_h

#include "../../string3.h"

namespace lewdo {

    void PrintString3(string3_ptr str) {
        auto n = str.count();
        std::wcout.flush();
        wchar_t text[2] = { L' ', 0 };
        std::cout << "Printing...\n";
        for (auto y=0; y<str.size.v[1]; y++) {
            for (auto x=0; x<str.size.v[0]; x++) {
                auto letter = L' ';
                for (auto z=((long)str.size.v[2])-1; z>=0; z--) {
                    auto cur = str.Get(size3_t(x,y,z));
                    if (cur != L' ') letter = cur;
                }
                text[0] = letter;
                std::wcout << letter;
            }
            std::wcout << "\n";
        }
        std::wcout << "Done.\n";
        std::wcout.flush();
    }
    
}

#endif /* string3_stdout_h */

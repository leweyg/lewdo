//
//  lewdo_code.h
//
//  Created by Lewey Geselowitz on 9/30/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#include <iostream>
#include <stdlib.h>
#include <math.h>

#include "../../include/string3.h"
#include "../../include/platforms/std/string3_stdout.h"
#include "../../include/shapes/lewdo_code.h"

size3_t size(8,16,4);

int main(int argc, char** argv)
{
    
    string3_ptr testString = string3_ptr::String(L"lewdo\v\nworld");
    PrintString3( testString );
    
    lewdo::lewdo_code code;
    code.demo();
    string3_ptr codeShow = code.ToString3();
    PrintString3(codeShow);
}

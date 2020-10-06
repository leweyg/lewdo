//
//  lewdo_code.h
//
//  Created by Lewey Geselowitz on 9/30/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#include <iostream>
#include <stdlib.h>
#include <math.h>

#include "../../include/lewdo.h"
#include "../../include/platforms/std/string3_stdout.h"
#include "../../include/shapes/lewdo_code.h"

#include "../../include/platforms/gl/string3_glut.h"

using namespace lewdo;

size3_t size(8,16,4);

int main(int argc, char** argv)
{
    lewdo::lewdo_app app;
    auto testString = lewdo::string3_ptr::String(L"lewdo\v\nworld");
    app.app_out.buffer.Copy( testString );
    PrintString3( app.app_out.buffer );
    
    lewdo::shape::lewdo_code code;
    code.demo();
    string3_ptr codeShow = code.ToString3();
    PrintString3(codeShow);
    
    // Start the OpenGL project:
    lewdo_glut::main(argc,argv);
}

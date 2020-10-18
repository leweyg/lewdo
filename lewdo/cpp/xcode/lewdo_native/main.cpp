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
#include "../../include/shapes/tree.h"

#include "../../include/platforms/gl/string3_glut.h"

#include "../../include/shapes/hyperspace.h"

#include "../../include/platforms/gl/hyperspace_gl.h"

#include "../../include/platforms/std/string3_pipe.h"

using namespace lewdo;

size3_t size(8,16,4);

int main(int argc, char** argv)
{
    lewdo::shape::tree::Test_Tree();
    return 0;
    
    lewdo::lewdo_app app;
    auto testString = lewdo::string3_ptr::String(L"lewdo\v\nworld");
    app.app_out.buffer.Copy( testString );
    PrintString3( app.app_out.buffer );
    
    lewdo_shapes_code::lewdo_code code;
    code.demo();
    string3_ptr codeShow = code.ToString3();
    PrintString3(codeShow);
    
    auto hyperString3 = lewdo_shapes_hyperspace::string3_hypershape_ptr::allocate( app.app_out.buffer );
    auto vec = lewdo_shapes_hyperspace::hypershaped_vector_ptr::allocate_standard(hyperString3.shape);
    for (auto i=0; i<hyperString3.shape->vector_count_cached; i++) {
        hyperString3.data.vector_by_index_read( &vec, i, nullptr );
    }
    
    std::string folder = __FILE__;
    string3_pipe_t hosted( folder );
    if (hosted.state.buffer.size.count() != 0) {
        app.app_out.buffer = hosted.state.buffer;
        app.app_out.frameStep();
    }
    
    // Start the OpenGL project:
    lewdo_glut::main(&app, argc, argv);
    
    hyperString3.free_bounds_and_shape();
    
    
}

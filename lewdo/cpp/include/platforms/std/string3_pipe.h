//
//  string3_pipe.h
//  lewdo_native
//
//  Created by Lewey Geselowitz on 10/10/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef string3_pipe_h
#define string3_pipe_h

#include "../../string3.h"

#include <mutex>
#include <string>
#include <iostream>
#include <chrono>
#include <thread>
#include <unistd.h>

namespace lewdo {
    
    class string3_pipe_t {
    private:
        FILE* pFile = nullptr;
        std::mutex  mutex_read;
        std::mutex  mutex_write;
        
    public:
        string3_observable state;
        
        string3_pipe_t(std::string folder) {
            auto folderStarts = "lewdo/";
            folder = folder.substr( 0, folder.find(folderStarts) ) + folderStarts;
            open_lewdo_node(folder);
            for (int i=0; i<2; i++) {
                std::cout << "Step " << i << "\n";
                read_blocking();
                //std::this_thread::sleep_for( std::chrono::seconds(1) );
            }
            close();
        }
        
    private:
        
        void open_lewdo_node(std::string folder) {
            chdir( folder.c_str() );
            std::string cmd = "/usr/local/bin/node app.js -3d -app text ";
            pFile = popen( cmd.c_str(),"r");
            assert( pFile );
        }
        
        bool read_blocking() {
            const size_t bufferSize = 1024 * 1024;
            char buffer[ bufferSize ] = { 0 };
            wchar_t wbuffer[ bufferSize ];
            size_t byte_count = fread(buffer, 1, bufferSize, pFile);
            if (byte_count == 0) {
                //std::cout << "No result or done.\n";
                return false;
            }
            for (int i=0; i<byte_count; i++) {
                wbuffer[i] = buffer[i]; // to unicode
            }
            buffer[ byte_count ] = 0;
            wbuffer[byte_count ] = 0;
            state.buffer = lewdo::string3_ptr::String(wbuffer);
            state.frameStep();
            //std::cout << "Read [" << buffer << "]\n";
            
            return true;
        }
        
        void close() {
            auto toClose = pFile;
            pFile = nullptr;
            pclose( toClose );
        }
    };
}

#endif /* string3_pipe_h */

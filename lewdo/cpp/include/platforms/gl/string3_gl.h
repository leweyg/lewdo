//
//  string3_gl.h
//  lewdo_native
//
//  Created by Lewey Geselowitz on 10/5/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef string3_gl_h
#define string3_gl_h

#include "../../string3.h"
#include "../../math3_t.h"
#include "../../shapes/font.h"

#include <OpenGL/gl.h>


namespace lewdo {
    
    class string3_GLContext {
    private:
        int drawCallDepth = 0;
        float generalScale = 1.0f;
        size3_t displaySize;
        GLuint texture_font=~0;
        bool useTexturing = true;
        
        float3_t LocalToWorld(size3_t offset) {
            float3_t result;
            const float scale = generalScale;
            const float zscale = generalScale * -4.0f;
            const float origin[3] = {
                -((float)displaySize.v[0])/2.0f,
                -((float)displaySize.v[1])/2.0f,
                0.0f,
            };
            EXPAND3_i(result.v[i] = (scale * (origin[i] + offset.v[i])));
            result.v[2] *= zscale;
            return result;
        }
        
        GLuint ensure_font_texture() {
            if (texture_font != ~0) {
                return texture_font;
            }
            GLuint texture_id;
            auto pSource = lewdo_font_tensor;
            auto width = pSource.size.v[0];
            auto height = pSource.size.v[1];
            auto errCode = glGetError();
            //texture map
            glGenTextures(1,&texture_id);
            texture_font = texture_id;
            glActiveTexture(GL_TEXTURE0);
            glBindTexture(GL_TEXTURE_3D,texture_id);
            glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
            errCode = glGetError();
            
            uint8_t* pSourceData = (uint8_t*)malloc( sizeof(uint8_t) * 4 * pSource.size.count() );
            for (auto i=0; i<pSource.size.count(); i++) {
                auto alpha = (pSource.array1d[i] ? 255 : 0);
                auto color =(pSource.array1d[i] ? 0 : 255);
                pSourceData[(i*4)+0] = color;
                pSourceData[(i*4)+1] = color;
                pSourceData[(i*4)+2] = color;
                pSourceData[(i*4)+3] = alpha;
            }
            
            glTexImage3D(GL_TEXTURE_3D, 0, GL_RGBA8,
                        (GLsizei)pSource.size.v[0], (GLsizei)pSource.size.v[1], (GLsizei)pSource.size.v[2],
                         0, GL_RGBA, GL_UNSIGNED_BYTE, pSourceData );
            free( pSourceData );
            
            errCode = glGetError();
            glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
            glTexParameteri(GL_TEXTURE_3D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
            
            return texture_id;
        }
        
        void myBegin() {
            if (drawCallDepth!=0) {
                drawCallDepth++;
                return;
            }
            
            if (useTexturing) {
                glEnable(GL_TEXTURE_3D);
                glBindTexture(GL_TEXTURE_3D, ensure_font_texture() );
                glActiveTexture(GL_TEXTURE0);
            }
            
            glEnable(GL_BLEND);
            glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
            
            drawCallDepth = 1;
            glBegin(GL_TRIANGLES);
            if (useTexturing) {
                glColor3f(1.0f,1.0f,1.0f);
            }
            
            
        }
        
        void myEnd() {
            drawCallDepth--;
            
            if (drawCallDepth>0) {
                return;
            }
            
            if (drawCallDepth==0) {
                glEnd();
            }
            assert( drawCallDepth >= 0 );
            
            if (useTexturing) {
                glDisable(GL_TEXTURE_3D);
            }
        }
        
    public:
        string3_GLContext() {}
        
        void configureScale(size3_t size) {
            if (useTexturing) {
                displaySize = size;
            } else {
                displaySize = size.multiply( font_size_2D() );
            }
            size = displaySize;
            auto mx = (size.v[0] > size.v[1]) ? size.v[0] : size.v[1];
            generalScale = 1.0f / ((float)mx);
        }
        
        void drawString3(string3_ptr str3) {
            myBegin();
            // continue here
            auto size = str3.size;
            int sizeZ = (int)size.v[2];
            auto size2D = size;
            size2D.v[2] = 1;
            
            for (auto z=sizeZ-1; z>=0; z--) {
                for (auto i=size2D.begin(); i!=size2D.end(); i++) {
                    auto pos = size2D.unpack(i);
                    pos.v[2] = z;
                    auto letter = str3.Get( pos );
                    drawChar( letter, pos );
                }
            }
            /*
            for (auto i=size.begin(); i!=size.end(); i++) {
                auto letter = str3.Get1D(i);
                auto pos = size.unpack(i);
                drawChar( letter, pos );
            }
            */
            myEnd();
        }
        
        static bool isWhiteSpace(wchar_t letter) {
            switch (letter) {
                case 0:
                case ' ':
                case '\t':
                case '\n':
                case '\r':
                    return true;
                default:
                    return false;
            }
        }
        
        
        void drawChar(wchar_t letter, size3_t pos) {
            if (isWhiteSpace(letter)) return;
            
            
    
            if (useTexturing) {
                drawCharTextured(letter,pos);
            } else {
                float c = ((float)pos.v[2]) / 3.0f;
                glColor3f(c,c,c);
                drawCharBasicFont(letter,pos);
            }
            
        }
        
        size3_t font_size_2D() {
            auto fontSize2D = lewdo_font_tensor.size;
            fontSize2D.v[2] = 1;
            return fontSize2D;
        }
        
        void drawCharTextured(wchar_t letter, size3_t pos) {
            //glColor3f(1.0f,1.0f,1.f);
            float c = ((float)pos.v[2]) / ((float)displaySize.v[2]);
            glColor4f(1.0f,1.0f,1.0f,1.0f - c);
            drawQuad( pos, ((float)letter)/255.0f );
        }
        
        void drawCharBasicFont(wchar_t letter, size3_t pos) {
            auto pFont = &lewdo_font_tensor;
            auto fontSize2D = font_size_2D();
            auto fontStart = size3_t(0,0,letter);
            for (auto i=fontSize2D.begin(); i!=fontSize2D.end(); i++) {
                auto fontPos = fontSize2D.unpack(i);
                
                auto fontResult = pFont->Get(fontStart.add(fontPos));
                if (fontResult != 0) {
                    drawQuad( pos.multiply(fontSize2D).add(fontPos), ((float)letter)/255.0f );
                }
            }
        }
        
        void drawQuad(size3_t pos, float textureZ) {
            myBegin();
            
            static const int numVerts = 6;
            static const size3_t offsets[numVerts] = {
                size3_t(0.0f,0.0f,0.0f),
                size3_t(0.0f,1.0f,0.0f),
                size3_t(1.0f,0.0f,0.0f),
                size3_t(1.0f,1.0f,0.0f),
                size3_t(0.0f,1.0f,0.0f),
                size3_t(1.0f,0.0f,0.0f),
            };
            
            for (auto i=0; i<numVerts; i++) {
                auto c = pos.add(offsets[i]);
                auto p = LocalToWorld(c);
                glTexCoord3f(offsets[i].v[0], offsets[i].v[1], textureZ);
                glVertex3fv(p.data());
            }
            
            myEnd();
        }
        
        
        
    private:

        void drawQuad() {
            glBegin(GL_TRIANGLES);
            //float v[3] = { 0.5, 0.5, 0.5 };
            
            //glColor3fv(v);
            glColor3f(0.5f,0.5f,0.5f);
            
            glVertex3f(0.0f,0.0f,0.0f);
            glVertex3f(0.0f,1.0f,0.0f);
            glVertex3f(1.0f,0.0f,0.0f);
            
            glVertex3f(1.0f,1.0f,0.0f);
            glVertex3f(0.0f,1.0f,0.0f);
            glVertex3f(1.0f,0.0f,0.0f);
            
            glEnd();
        }
        
        
        
    };
    
}

#endif /* string3_gl_h */

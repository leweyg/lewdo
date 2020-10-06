//
//  string3_glut.h
//  lewdo_native
//
//  Created by Lewey Geselowitz on 10/5/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef string3_glut_h
#define string3_glut_h

#define GL_SILENCE_DEPRECATION 1
#include "string3_gl.h"
#include <GLUT/glut.h>

const GLfloat EDGE = 50.0;
const GLfloat SQR3 = sqrt(3);
const GLfloat SQR6 = sqrt(6);

namespace lewdo {
    
    class lewdo_glut;
    
    class lewdo_glut {
    public:
        static int main(int argc, char** argv) {
            lewdo_glut app;
            return app.main_private(argc, argv);
        }
        
        static lewdo_glut* global_instance();
        
    private:
        
        void init() {
            glEnable(GL_DEPTH_TEST);
            glClearColor(1.0, 1.0, 1.0, 1.0);
            glColor3f(0.0, 1.0, 0.0);
            
            glMatrixMode(GL_PROJECTION);
            glLoadIdentity();
            glOrtho(0, EDGE, 0, EDGE*SQR3/2, -EDGE, 0);
            
            glMatrixMode(GL_MODELVIEW);
        }
        
        int main_private(int argc, char** argv) {
            
            glutInit(&argc, argv);
            
            glutInitDisplayMode(GLUT_RGB | GLUT_SINGLE | GLUT_DEPTH);
            
            glutInitWindowSize(500, 500*SQR3/2);
            glutInitWindowPosition(0, 0);
            glutCreateWindow("lewdo");
            
            glutKeyboardFunc(myKeyboardCallback);
            glutSpecialFunc(mySpecialKeyFunction);
            glutMouseFunc(myMouseFunc);
            glutMotionFunc(myMouseMove);
            glutPassiveMotionFunc(myMouseMove);
            
            glutDisplayFunc(display);
            
            glutWMCloseFunc([]() {
                exit(0);
            });
            
            
            glutMainLoop();
            return 0;
            
        }
        
        static void display() {
                
                glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
                
                glBegin(GL_TRIANGLES);
                //draw stuff
                glEnd();
                glFlush();
        }
        
        
        static void myKeyboardCallback(unsigned char key,
                                int x, int y) {
            if (key == 27) {
                exit(0);
            }
            std::cout << "Pressed key " << (int)key << " or letter '" << key << "' \n";
        }
        
        static void mySpecialKeyFunction(int key, int x, int y) {
            // responds when the user presses a special key.
            
            if ( key == GLUT_KEY_UP ) {
                std::cout << "GLUT_KEY_UP" << "\n";
            }
            if ( key == GLUT_KEY_DOWN ) {
                std::cout << "GLUT_KEY_DOWN" << "\n";
            }
            if ( key == GLUT_KEY_LEFT ) {
                std::cout << "GLUT_KEY_LEFT" << "\n";
            }
            if ( key == GLUT_KEY_RIGHT ) {
                std::cout << "GLUT_KEY_RIGHT" << "\n";
            }
        }
        
        static void myMouseFunc(int button, int state,
                         int x, int y) {
            if (state == GLUT_DOWN) {
                std::cout << "Mouse button " << button << " is down.\n";
            }
            else if (state == GLUT_UP) {
                std::cout << "Mouse button " << button << " is up.\n";
            }
            else {
                std::cout << "Mouse moved to " << x << "," << y << "\n";
            }
        }
        
        static void myMouseMove(int x, int y) {
            int w = glutGet(GLUT_WINDOW_WIDTH);
            int h = glutGet(GLUT_WINDOW_HEIGHT);
            int timeSinceStart = glutGet(GLUT_ELAPSED_TIME);
            float ux = ((float)x) / ((float)w);
            float uy = ((float)y) / ((float)h);
            if ((ux < 0) || (ux > 1) || (uy < 0) || (uy > 1)) {
                return; // out of bounds
            }
            //std::cout << "Mouse moved to " << ux << "," << uy << "\n";
        }

        
    };
    
    
    lewdo_glut lewdo_glut_g;
    static lewdo_glut* global_instance() { return &lewdo_glut_g; }
    
}

#endif /* string3_glut_h */

//
//  tree.h
//  lewdo_native
//
//  Created by Lewey Geselowitz on 10/17/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef tree_h
#define tree_h

namespace lewdo { namespace shape { namespace tree {
    
    template <typename K,typename V> class TreeNode {
    public:
        TreeNode *Lower, *Higher;
        K Key;
        V Value;
    };
    
    template <typename K,typename V> class Tree {
    public:
        TreeNode<K,V>* Root;
        
        Tree() {
            
        };
        
        int CompareKeys(K a, K b) {
            if (a == b) {
                return 0;
            }
            return ((a < b) ? -1 : 1);
        }
        
        void RotateLowerKey(K key) {
            TreeNode<K,V>** above = nullptr;
            auto at = FindNearest(key, &above);
            if (at) {
                *above = this->RotateLower( at );
            }
        }
        
    private:
        TreeNode<K,V>* RotateLower(TreeNode<K,V>* parent) {
            auto t = parent->Lower;
            parent->Lower = t->Higher;
            t->Higher = parent;
            return t;
        };
        
    public:
        TreeNode<K,V>* FindNearest(K key, TreeNode<K,V>*** out_link=nullptr) {
            TreeNode<K,V>** next = &Root;
            for (TreeNode<K,V>* cur = this->Root; cur != nullptr; cur = *next) {
                auto cmp = CompareKeys( key, cur->Key );
                if (cmp == 0) {
                    if (out_link) {
                        *out_link = next;
                    }
                    return cur;
                }
                if (cmp < 0) {
                    next = &( cur->Lower );
                } else {
                    next = &( cur->Higher );
                }
            }
            if (out_link) *out_link = next;
            return nullptr;
        }
        
        void Add(K key, V val) {
            auto node = new TreeNode<K,V>();
            node->Key = key;
            node->Value = val;
            node->Lower = nullptr;
            node->Higher = nullptr;
            Insert(node);
        };
        
        void Insert(TreeNode<K,V>* node) {
            TreeNode<K,V>** link = nullptr;
            auto already = this->FindNearest( node->Key, &link );
            if (already) {
                return;
            }
            if (link) {
                *link = node;
                return;
            }
            Root = node;
        }
        
        void DeleteNode(TreeNode<K,V>* node, TreeNode<K,V>** parentLink = nullptr) {
            if (!node) {
                return;
            }
            if (!parentLink) {
                FindNearest(node->Key, &parentLink);
            }
            *parentLink = nullptr;
            if (node->Lower) {
                this->Insert(node->Lower);
                node->Lower = nullptr;
            }
            if (node->Higher) {
                this->Insert(node->Higher);
                node->Higher = nullptr;
            }
            delete node;
        }
        
        void DeleteAll() {
            DeleteNodeRecursive( &Root );
        }
        
        ~Tree() {
            DeleteAll();
        }
        
        void DeleteNodeRecursive( TreeNode<K,V>** parentLink = nullptr) {
            auto node = *parentLink;
            if (!node) {
                return;
            }
            DeleteNodeRecursive( &(node->Lower) );
            DeleteNodeRecursive( &(node->Higher) );
            DeleteNode( node, parentLink );
            assert( *parentLink == nullptr );
        }
        
        
        void PrintTree() {
            std::cout << "Tree:\n";
            PrintNode( Root, 0 );
        }
        
    private:
        void PrintNode(TreeNode<K,V>* node, int depth) {
            if (!node) {
                return;
            }
            if (node->Lower) {
                PrintNode(node->Lower,depth+1);
            }
            for (int i=0; i<depth; i++) {
                std::cout << "  ";
            }
            char str[2] = { '?', 0 };
            str[0] = node->Key;
            std::cout << str << "\n";
            if (node->Higher) {
                PrintNode(node->Higher,depth+1);
            }
        }
    };
    
    void Test_Tree() {
        Tree<wchar_t,int> letters;
        letters.Add( 'A', 1 );
        letters.Add( 'C', 1 );
        letters.Add( 'B', 1 );
        letters.Add( 'D', 1 );
        letters.Add( 'E', 1 );
        letters.Add( 'F', 1 );
        letters.Add( 'G', 1 );
        letters.PrintTree();
        
        letters.RotateLowerKey('C');
        letters.PrintTree();
        
        letters.DeleteAll();
        letters.PrintTree();
    }
    
} } }

#endif /* tree_h */

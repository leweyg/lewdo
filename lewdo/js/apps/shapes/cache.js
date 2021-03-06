
var lewdo_cache = {
    create : function(app) {
        var context = Object.create( lewdo_cache.lewdo_cache_prototype );
        context.setup(app || lewdo.app());
        return context;
    },
    app : function(_app) {
        var context = lewdo_cache.create(_app);
        return context;
    },
    demo : function(_app) {
        var context = lewdo_cache.app( _app );
        context.AddDemoContent();
        context.record.redraw();

        context.app.app_out.copy(context.record.app.app_out);
        context.app.app_out.frameStep();

        return context;
    },
    g_Time : 0,
    CacheEntry_Prototype : {
        Key : "name",
        Value : 0,
        Priority : 0,
        ExpirationTime : 0,
        prev : null,
        next : null,
        LatestAccess : 0,

        HasExpired : function() {
            if (lewdo_cache.g_Time >= this.ExpirationTime) {
                return true;
            }
            return false;
        }
    },
    lewdo_cache_prototype : {
        app : lewdo.app(),
        maxItems : 5,
        access_index : 1,
        record : null,

        entriesByKey : {},
        recentList : {first:null,last:null,},
        null_ptr : null,

        setup : function(_app) {
            this.app = _app;

            this.record = lewdo.apps.shapes.code();
            this.record.formatContent = function(info,str3,pos,op) {
                var str = str3.toString()
                if ((str==".") && info.value) {
                    str = str3.toString() + info.value;
                    return lewdo.string3(str);
                }
                if ((str==lewdo.letter.play)) {
                    str = str3.toString() + op.valueInfo.value;
                    return lewdo.string3(str);
                }
                return str3;
            };
            this.record.preloadViz = ((viz,cb) => {
                cb( null );
                cb( "first" );
                cb( "last" );
                cb( "next" );
                cb( "prev" );
            });
            this.record.legend = true;
            this.record.legend_centered = true;

            this.record.addWriteOffset(this.recentList,"first",this.null_ptr);
            this.record.addWriteOffset(this.recentList,"last",this.null_ptr);

            this.app.app_out.copy(lewdo.string3("cache\ndemo"));
            this.app.app_out.frameStep();
        },

        RecentListAdd : function(entry) {
            entry.next = this.recentList.first;
            this.record.addWriteOffset(entry,"next",this.recentList.first);

            this.record.addReadOffset( this.recentList, "first", this.recentList.first );
            if (this.recentList.first) {
                this.recentList.first.prev = entry;
                this.record.addWriteOffset(this.recentList.first,"prev",entry);
            }
            
            this.recentList.first = entry;
            this.record.addWriteOffset(this.recentList,"first",entry);

            this.record.addReadOffset( this.recentList, "last", this.recentList.last );
            if (!this.recentList.last) {
                this.recentList.last = entry;
                this.record.addWriteOffset(this.recentList,"last",entry);
            }
        },

        RecentListRemove : function(entry) {
            this.record.addReadOffset( entry, "prev", entry.prev );
            if (entry.prev) {
                entry.prev.next = entry.next;
                this.record.addWriteOffset(entry.prev,"next",entry.next);
            } else {
                this.recentList.first = entry.next;
                this.record.addWriteOffset(this.recentList,"first",entry.next);
            }
            this.record.addReadOffset( entry, "next", entry.next );
            if (entry.next) {
                entry.next.prev = entry.prev;
                this.record.addWriteOffset(entry.next,"prev",entry.prev);
            } else {
                this.recentList.last = entry.prev;
                this.record.addWriteOffset(this.recentList,"last",entry.prev);
            }
        },

        Set : function(key, value, priority, expiryInSecs) {
            this.record.addExecuteRead(this.entriesByKey, "set");
            this.EvictItems(1);

            

            var entry = Object.create( lewdo_cache.CacheEntry_Prototype );
            entry.Key = key;
            entry.Value = value;
            entry.Priority = priority;
            entry.ExpirationTime = expiryInSecs + lewdo_cache.g_Time;
            entry.LatestAccess = (this.access_index++);

            this.record.addWriteOffset(this.entriesByKey, key, entry);
            this.entriesByKey[key] = entry;

            //this.RecentListRemove( entry );
            this.RecentListAdd( entry );

            return entry;
        },

        Get : function(key) {
            this.record.addExecuteRead(this.entriesByKey, "get");

            this.EvictItems(0);
            var entry = this.entriesByKey[key];
            entry.LatestAccess = (this.access_index++);
            this.record.addTime();
            this.record.addReadOffset(this.entriesByKey, key, entry);
            this.RecentListRemove( entry );
            this.RecentListAdd( entry );
            return entry;
        },

        DebugPrintKeys : function() {
            var combined = "[ ";
            var isFirst = true;
            for (var key in this.entriesByKey) {
                var entry = this.entriesByKey[key];
                if (!isFirst) combined += ", ";
                combined += key;
                isFirst = false;
            }
            combined += " ]";
            console.log( combined );
        },

        SetMaxItems : function(n) {
            this.maxItems = n;
            this.EvictItems();
        },

        EraseEntry : function(entry) {
            console.log("Freeing...");
            this.record.addExecuteRead(this.entriesByKey, "evict");
            this.record.addTime();
            this.RecentListRemove(entry);
            this.record.addFreeOffset(this.entriesByKey,entry.Key,entry);
            delete this.entriesByKey[entry.Key];
            console.assert( !(entry.Key in this.entriesByKey) );
        },

        EvictItems : function(countNeeded) {
            countNeeded = (countNeeded || 0);
            var countToEvict = ((Object.keys(this.entriesByKey).length + countNeeded) - this.maxItems);

            for (var key in this.entriesByKey) {
                var entry = this.entriesByKey[key];
                if (entry.HasExpired()) {
                    countToEvict--;
                    this.EraseEntry(entry);
                }
            }

            if (countToEvict <= 0) {
                return;
            }

            // TODO: remove items in LRU
            var entriesByPriInLRU = [];
            for (var key in this.entriesByKey) {
                entriesByPriInLRU.push(this.entriesByKey[key]);
            }
            entriesByPriInLRU.sort((a,b)=>{
                if (a.Priority != b.Priority)
                    return ((a.Priority > b.Priority)?-1:1);
                return (a.LatestAccess < b.LatestAccess)?1:-1;
            });
            while ((countToEvict > 0) && (entriesByPriInLRU.length > 0)) {
                var top = entriesByPriInLRU.pop();
                this.EraseEntry(top);
                countToEvict--;
            }
        },

        AddDemoContent : function() {

            var c = this;
            c.SetMaxItems(5);

            c.Set("A", 1, 5,  100 );
            c.Set("B", 2, 15, 3   );
            c.Set("C", 3, 5,  10  );
            c.Set("D", 4, 1,  15  );
            c.Set("E", 5, 5,  150 );
            c.Get("C");
            
            
            // Current time = 0
            c.SetMaxItems(5);
            // Keys in C = ["A", "B", "C", "D", "E"]
            // space for 5 keys, all 5 items are included
            c.DebugPrintKeys();
            
            // Sleep for 5 secs
            lewdo_cache.g_Time += 5;
            
            // Current time = 5
            c.SetMaxItems(4);
            // Keys in C = ["A", "C", "D", "E"]
            // "B" is removed because it is expired.  e3 < e5
            c.DebugPrintKeys();
            
            c.SetMaxItems(3);
            // Keys in C = ["A", "C", "E"]
            // "D" is removed because it the lowest priority
            // D's expire time is irrelevant.
            c.DebugPrintKeys();
            
            c.SetMaxItems(2);
            // Keys in C = ["C", "E"]
            // "A" is removed because it is least recently used."
            // A's expire time is irrelevant.
            c.DebugPrintKeys();
            
            c.SetMaxItems(1);
            // Keys in C = ["C"]
            // "E" is removed because C is more recently used (due to the Get("C") event).
            c.DebugPrintKeys();
            
            // leweyg-note: Added this test which uses recycling to avoid memory delete+new:
            //c.Set("R", 5, 5,  150 );
            // Keys in R = ["R"]
            // "C" is removed because R is more recently used. Note that the C's memory is recycled into R
            //c.DebugPrintKeys();
            
        }
    }
};

lewdo.apps.shapes.cache = lewdo_cache.app;
lewdo.apps.tools.cache = lewdo_cache.demo;


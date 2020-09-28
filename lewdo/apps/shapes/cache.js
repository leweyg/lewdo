
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
        return context;
    },
    g_Time : 0,
    CacheEntry_Prototype : {
        Key : "name",
        Value : 0,
        Priority : 0,
        ExpirationTime : 0,
        PriorityEntryPrev : null,
        PriorityEntryNext : null,
    },
    lewdo_cache_prototype : {
        app : lewdo.app(),
        maxItems : 5,

        entriesByKey : {},


        setup : function(_app) {
            this.app = _app;

            this.app.app_out.copy(lewdo.string3("cache\ndemo"));
            this.app.app_out.frameStep();
        },

        Set : function(key, value, priority, expiryInSecs) {
            this.EvictItems();

            var entry = Object.create( lewdo_cache.CacheEntry_Prototype );
            entry.Key = key;
            entry.Value = value;
            entry.Priority = priority;
            entry.ExpirationTime = expiryInSecs + lewdo_cache.g_Time;
            
            this.entriesByKey[key] = entry;
            return entry;
        },

        Get : function(key) {
            var entry = this.entriesByKey[key];
            return entry;
        },

        DebugPrintKeys : function() {
            for (var key in this.entriesByKey) {
                var entry = this.entriesByKey[key];
                console.log("Entry[" + key + "]=" + entry.Value);
            }
        },

        SetMaxItems : function(n) {
            this.maxItems = n;
            this.EvictItems();
        },

        EvictItems : function() {

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
            g_Time += 5;
            
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
            c.Set("R", 5, 5,  150 );
            // Keys in R = ["R"]
            // "C" is removed because R is more recently used. Note that the C's memory is recycled into R
            c.DebugPrintKeys();
            
        }
    }
};

lewdo.apps.shapes.cache = lewdo_cache.app;
lewdo.apps.tools.cache = lewdo_cache.demo;


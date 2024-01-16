
export var computedIn3D = {

    computation : function(arg1) {
        return Object.create(computedIn3D.types.computation_proto).initialize(arg1);
    },

    html_writer : function(compute) {
        return Object.create(computedIn3D.types.html_writer_proto).initialize(compute);
    },

    types : {
        computation_proto : {
            identities : [],
            times : [],
            addresses : [],
            values : [],
            vertices : [],
            edges : [],
            _id_counter : 0,
            initialize : function(arg1) {
                this.identities = [];
                return this;
            },
            addId : function(name) {
                this._id_counter++;
                var id = Object.create(computedIn3D.types.compute_id_proto);
                id.initialize(this);
                if (name) {
                    id.name = name;
                }
                this.identities.push(id);
                return id;
            },
            findId : function(name) {
                for (var i in this.identities) {
                    var id = this.identities[i];
                    if (id.name == name) return id;
                }
                return null;
            },
            ensureId : function(name) {
                var already = this.findId(name);
                if (already) return already;
                return this.addId(name);
            },
            ensureItemInList : function(item,list) {
                for (var i in list) {
                    var cur = list[i];
                    if (cur === item) {
                        return;
                    }
                }
                list.push(item);
            },
            addVertex : function(when,where,what) {
                var vert = Object.create(computedIn3D.types.compute_vertex_proto)
                    .initialize(this);
                vert.when = when;
                vert.where = where;
                vert.what = what;
                this.ensureItemInList(when, this.times);
                this.ensureItemInList(where, this.addresses);
                this.ensureItemInList(what, this.values);
                this.vertices.push(vert);
                return vert;
            },
            addEdge : function(vertexFrom, vertexTo) {
                var edge = Object.create(computedIn3D.types.compute_edge_proto)
                    .initialize(this);
                edge.from = vertexFrom;
                edge.to = vertexTo;
                this.edges.push(edge);
                return edge;
            },

            setupBasicTimes : function() {
                var time = this.ensureId("time");
                var before = this.ensureId("before");
                var after = this.ensureId("after");
                var start = this.addVertex(before,time,before);
                var end = this.addVertex(after,time,after);
            },


        },
        compute_vertex_proto : {
            // identities:
            where : null,
            when : null,
            what : null,

            initialize : function(comp) {
                return this;
            }
        },
        compute_edge_proto : {
            // vertices:
            from : null,
            to : null,

            initialize : function(comp) {
                return this;
            }
        },
        compute_id_proto : {
            unique_id : 0,
            name : "name",

            initialize : function(comp) {
                this.unique_id = comp._id_counter;
                this.name = "g" + this.unique_id;
                return this;
            }
        },
        html_writer_proto : {
            computation : null,
            write_table : function() {
                var ans = "<table>";
                var comp = this.computation;

                ans += "<tr>";
                ans += "<td>&</td>"
                for (var i in comp.values) {
                    ans += "<td>";
                    ans += comp.values[i].name;
                    ans += "</td>";
                }
                ans += "</tr>";

                for (var ai in comp.addresses) {
                    ans += "<tr>";
                    var addr = comp.addresses[ai];

                    ans += "<td>";
                    ans += addr.name;
                    ans += "</td>";

                    for (var i in comp.values) {
                        ans += "<td>";
                        var val = comp.values[i];
                        
                        for (var vi in comp.vertices) {
                            var vert = comp.vertices[vi];
                            if ((vert.where == addr) && (vert.what == val)) {
                                ans += "@" + vert.when.name + " ";
                            }
                        }

                        ans += "</td>";
                    }


                    ans += "</tr>";
                }

                ans += "</table>";
                return ans;
            },

            initialize : function(computation) {
                this.computation = computation;
                return this;
            }
        },
    },
};

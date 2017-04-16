var graph,
    data,
    code_correspond_description;

var canvas,
    context,
    width,
    height,
    transform;

var simulation,tooltip;

var node_pointed,
    link_associated  = [],
    node_associated = [],
    node_for_text = {id : "arbitrary"},
    node_pointed_previous = {id : "arbitrary"},
    node_associated_previous = [{id:'arbitrary'}];

function jquery(){
  d3.select("#infoPanel_Data_name").transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  $('#infoPanel_Data_name').text(node_for_text.name)

  d3.select("#infoPanel_Location").transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  $('#infoPanel_Location').text("Address:   "+node_for_text.address+", "+node_for_text.boro+", "+node_for_text.postcode)

  d3.select("#infoPanel_Category").transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  $('#infoPanel_Category').text("Category:   "+node_for_text.categories)

  var ago = moment.duration(moment().diff(node_for_text.violation.recentTime)).humanize() + " ago";
  d3.select("#infoPanel_LastInspect").transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  $('#infoPanel_LastInspect').text("last time sanitary inspection:   "+ago)
  /*****************************************************************
  * overflow dark_side;
  *
  *****************************************************************/
  // svg.selectAll('rect').data(node_for_text.violation.historyVcode)
  // .enter().append('rect').attr('x',10)
  //
  d3.select('.dark_side_list')
  //   .selectAll('li')
  //   .data(node_for_text.violation.historyVcode)
  //   .enter()
  //   .append('li')

    // .text(function(d){ return data})

};

function draw_vio_tooltip(d){
  tooltip.transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  tooltip.html("AAA"+d.id)
    .style("left", transform.applyX(d.x) + "px")
    .style("top", transform.applyY(d.y) + "px");
};

function draw_tooltip_mouseover_r(){
  tooltip.transition()
    .duration(200)
    .style("opacity", 0);

  if(node_associated_previous[0].id !== node_associated[0].id){
    node_associated_previous = node_associated;
    var arr_for_div = [];
    node_associated_previous.forEach(function(d){
      if(d.gr == 'v'){
        var a = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);
        a.transition().duration(10/2)
          .style("opacity", 0)
          .transition().duration(1000/2)
          .style("opacity", 1)
        a.html("AAA")
          .style("left", transform.applyX(d.x) + "px")
          .style("top", transform.applyY(d.y) + "px");
        arr_for_div.push(a);
      }
    });
  };
  if(node_associated_previous[0].id == node_associated[0].id){
    arr_for_div.forEach(function(d){
      d.remove()
    })
  };
}

function drawLink(d){
  context.moveTo(d.source.x, d.source.y);
  context.lineTo(d.target.x, d.target.y);
};

function drawNode_inspc(d) {
  if(d.gr == 'v' ){
    context.moveTo(d.x + 10, d.y);
    context.arc(d.x, d.y, 10, 0, 2 * Math.PI);
  }
};

function drawNode_restaurant_A(d) {
  if(d.gr == 'r' ){
    if(d.gd >0 && d.gd <13){
      context.moveTo(d.x + 3, d.y);
      context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
    }
  }
};

function drawNode_restaurant_B(d) {
  if(d.gr == 'r' ){
    if(d.gd >13 && d.gd <27){
      context.moveTo(d.x + 3, d.y);
      context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
    }
  }
};

function drawNode_restaurant_C(d) {
  if(d.gr == 'r' ){
    if(d.gd >27 ){
      context.moveTo(d.x + 3, d.y);
      context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
    }
  }
};

function drawNode_interact(d) {
  if(d.gr == 'r' ){
    context.moveTo(d.x + 3, d.y);
    context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
  }
  if(d.gr == 'v' ) {
    context.moveTo(d.x + 10, d.y);
    context.arc(d.x, d.y, 10, 0, 2 * Math.PI);
  }
};

function removeDuplicates(originalArray, prop) {
  var newArray = [];
  var lookupObject  = {};
  for(var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  }
  for(i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  return newArray;
};

function setup(cb){
    d3.select('body')
    	.append('canvas')
    	.attr('height',window.innerHeight)
      .attr('width',window.innerWidth)
      .canvas(true);
    canvas = document.querySelector('canvas');
    context = canvas.getContext('2d');
    width = canvas.width;
    height = canvas.height;
    transform = d3.zoomIdentity;
    /*****************************************************************
    * configure simulation;
    *
    * use this configured simulation on draw_wheel.
    *****************************************************************/
    simulation = d3.forceSimulation()
      .force(  'link', d3.forceLink().id(function(d){ return d.id;})  )
      .force(  'charge', d3.forceManyBody().strength(-140).distanceMax(202).distanceMin(function(d){ return d3.randomUniform(3000)()})  )
      .force(  'center', d3.forceCenter(-(width * 0.1),height *0.25))  //-(width*0.05),height *1.65/ 3)
      .force(  'forceX', d3.forceX(1000).x(1000)  )
      .force(  'forceY', d3.forceY(1000)  )
      .force(  'Collision', d3.forceCollide(
          function(d){
            if(d.gr == "v"){
              return 20
            }else{
              return null
            }
          })
      )
      .alpha(  .05  )
      .velocityDecay(  0.2  )
      // .stop();
    tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    /********************|     loading data     |**********************
    * use queue to load data
    *
    * @callback requestCallback
    * @param {number} responseCode
    * @param {string} responseMessage
    *****************************************************************/
    d3.queue()
      .defer(d3.json, 'n_l_v2.json')
      .defer(d3.json, 'mar_25_all_mahat_5233outOf9881.json')
      .defer(d3.json, 'code_correspond_description.json')
      .await(function(err, _graph, _data, _code_correspond_description){ if(err) throw err;
          graph  =  _graph;
          data  =  _data;
          code_correspond_description  =  _code_correspond_description;
          cb();
      }) // queue
};


function draw_wheel(){
    /*****************************************************************
    * init wheel position;
    *
    * zoomLevel, position, etc.
    *****************************************************************/
    zoom = d3.zoom()
    	.scaleExtent([.25,.8])
      .on('zoom',function (){
          transform = d3.event.transform;
          ticked();
      });
    zoom.scaleTo( d3.select(canvas), .55 );
    /*****************************************************************
    * bind simulation;
    *
    * binding nodes & links
    *****************************************************************/
    simulation
    	.nodes(graph.nodes)
      .on('tick',ticked);
    simulation.force('link')
      .links(graph.links)
      .distance(800);
    /*****************************************************************
    * bind drag;
    *
    * important: drag_subject
    *****************************************************************/
    select_canvas = d3.select(canvas)
      .call(d3.drag()
          .container(canvas)
          .subject()
      )
      .call(zoom).on("wheel.zoom", null)
      .on('mousemove',mv)
    /*****************************************************************
    * bind keyboard for zoom;
    *
    * @param {keyboard}
    *****************************************************************/
    Mousetrap.bind(['=', '+', 'pageup'], function() {
      select_canvas
      .call(zoom)
      .on("wheel.zoom", null)
      .call(zoom.scaleTo, transform.k +=.05)
    });
    Mousetrap.bind(['-', 'pagedown'], function() {
      select_canvas
      .call(zoom)
      .on("wheel.zoom", null)
      .call(zoom.scaleTo, transform.k -=.1);
    });

    function mv(){
        var p = d3.mouse(this); //coordinates
        var x = d3.event.x;
        /*****************************************************************
        * variable for pass nodes and related links to fc ticked();
          to update and draw those stuff.
        *
        * pushes link_associated & node_associated.
        *@callback draw_vio_tooltip()
        *@callback draw_tooltip_mouseover_r()
        *@callback removeDuplicates()
        *****************************************************************/
        (function create_node_link_associated(){
            node_pointed = simulation.find(transform.invertX(p[0]), transform.invertY(p[1]));
            link_associated = [];
            node_associated = [];
            graph.links.forEach(function(d){
                if(
                  d.source.index == node_pointed.index || d.target.index == node_pointed.index
                  ){
                    link_associated.push(d);
                    graph.nodes.forEach(function(d2){
                        if(d2.index == d.source.index || d2.index == d.target.index){
                           node_associated.push(d2);
                        };
                    });
                };
            });
            node_associated = removeDuplicates(node_associated,"id");
            if(node_pointed !== undefined) {
              ticked();
              if(node_pointed.gr){
                  if(node_pointed_previous.id !== node_pointed.id){
                    node_pointed_previous = node_pointed;
                    if(node_pointed.gr =='v'){
                    draw_vio_tooltip(node_pointed);
                    }
                    if(node_pointed.gr =='r'){
                      draw_tooltip_mouseover_r()
                    }
                  }
              }
            }
        })();

        //add text
        if(!isNaN(+node_pointed.id)){
          if(node_for_text.id !== +node_pointed.id){
            node_for_text = data[+node_pointed.id];
            jquery();
          }
        }
    }

  function ticked(){

      context.save();
      context.clearRect(0,0,width,height);
      context.translate(transform.x,transform.y);
      context.scale(transform.k,transform.k);

      //violations point
      context.beginPath();
      graph.nodes.forEach(drawNode_inspc);
      context.fillStyle = '#970ac6';
      context.fill();
      context.strokeStyle = '#1b1f3a';
      context.lineWidth =.5;
      context.stroke();
      //restaurants point: A
      context.beginPath();
      graph.nodes.forEach(drawNode_restaurant_A);
      context.fillStyle = '#cd772c'
      context.fill();
      context.strokeStyle = '#1b1f3a'
      context.stroke();
      //restaurants point: B
      context.beginPath();
      graph.nodes.forEach(drawNode_restaurant_B);
      context.fillStyle = '#297aef'
      context.fill();
      context.strokeStyle = '#1b1f3a'
      context.stroke();
      //restaurants point: C
      context.beginPath();
      graph.nodes.forEach(drawNode_restaurant_C);
      context.fillStyle = '#2aff50'
      context.fill();
      context.strokeStyle = '#1b1f3a'
      context.stroke();

      //interaction links
      if(link_associated.length !== 0){
          context.beginPath();
          link_associated.forEach(drawLink)
          context.strokeStyle = "rgba(151, 10, 198,0.575)";
          context.stroke();
      }
      //interaction nodes:
      if(node_associated.length !== 0){
        if(node_pointed.gr == 'r'){
            context.beginPath();
            node_associated.forEach(drawNode_interact);
            context.fillStyle = '#ffffff';  //"#09f2bf"
            context.fill()
            // .tansition()
            // .ease(d3.easeLinear)
            // .duration(100)
            ;
        }
        if(node_pointed.gr == 'v'){
            context.beginPath();
            node_associated.forEach(drawNode_interact);
            context.fillStyle = '#ffffff';  //"#09f2bf"
            context.fill();
        }
      }
      context.restore();
  }
  draw_vio_tooltip(d);
  draw_tooltip_mouseover_r();
}

setup(draw_wheel);

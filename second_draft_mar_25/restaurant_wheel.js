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
    node_for_violation = '',
    node_pointed_previous = {id : "__arbitrary"},
    node_associated_previous = [{id:'arbitrary'}];

var toggle_color_for_last_inspect = false,
    toggle_mv = true;

var rating_max = 9.7,
    rating_min = 4.5,
    color_for_rating = d3.scaleLinear()
    .domain([rating_min, rating_max])
    .range(["#FF6701", "#00B551"]);

function jquery(){
  $('#infoPanel_vio_code').css('display','none');
  $('#infoPanel_vio_des').css('display','none');
  $('.infoPanel_righthand_vio_rating').css('display','')
  d3.select("#infoPanel_Data_name").transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  $('#infoPanel_Data_name').text(node_for_text.name).css('display','')

  d3.select("#infoPanel_Location").transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  $('#infoPanel_Location').text("Address:   "+node_for_text.address+", "+node_for_text.boro+", "+node_for_text.postcode).css('visibility','visible')

  d3.select("#infoPanel_Category").transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  $('#infoPanel_Category').text("Category:   "+node_for_text.categories).css('visibility','visible')

  var ago = moment.duration(moment().diff(node_for_text.violation.recentTime)).humanize() + " ago";
  d3.select("#infoPanel_LastInspect").transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  $('#infoPanel_LastInspect').text("last time sanitary inspection:   "+ago).css('visibility','visible')
  /*****************************************************************
  * overflow dark_side;
  *
  *****************************************************************/
  d3.select(".dark_side_list")
    .selectAll('li')
    .remove()
  var item = d3.select('.dark_side_list')
    .selectAll('li')
    .data(node_for_text.violation.historyVCode)
    .enter()
    .append('li')
    .transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
    .attr('class','dark_item')
    .text(function(d){ return "problem code: "+ d +" -- "+ code_correspond_description[d]})
  /*****************************************************************
  * overflow rating;
  *
  *rating indicator;
  *****************************************************************/
  var pdl="";
  if(Number.isInteger(node_for_text.rating)){pdl = "15px" }else{ pdl = "12px"};
      d3.select("#rating_score_text").text(node_for_text.rating + " / 10")
        .style('font-size','0.5em')
        .style('color','white')
        .style('text-align','center')
        .style('position','absolute')
        .style('margin-top','5px')
        .style('padding-left',pdl)

      d3.select('#rating_score_block')
        .style('background-color',color_for_rating(node_for_text.rating))
        .style('border-radius','20px')
        .style('height',"20px")
        .style('width',"50px")
        .style('display',"inline-block")
        .style('margin-left',"30.7%")
  /*****************************************************************
  * overflow rating;
  *
  * positive
  *****************************************************************/
  d3.select(".rating_list_positive")
    .selectAll('li')
    .remove()
  // var item = d3.select('.rating_list_positive')
    // .selectAll('li')
    // .data()
};

function jquery_vio(){
  console.log(node_for_violation);
  // d3.select("#infoPanel_vio_code").transition().duration(10/2)
  //   .style("opacity", 0)
  //   .transition().duration(1000/2)
  //   .style("opacity", 1)
  $('#infoPanel_vio_code').text("Sanitation Problem Category: "+node_for_violation).css('display' , "inline")
  // d3.select("#infoPanel_vio_des").transition().duration(10/2)
  //   .style("opacity", 0)
  //   .transition().duration(1000/2)
  //   .style("opacity", 1)
  $('#infoPanel_vio_des').text(code_correspond_description[node_for_violation]).css('display','inline');
  //
  // d3.select("#infoPanel_Data_name").transition().duration(10/2)
  //   .style("opacity", 0)
  //   .transition().duration(1000/2)
  //   .style("opacity", 1)


  $('#infoPanel_Data_name').css('display','none')
  $('#infoPanel_Location').css('visibility','hidden')
  $('#infoPanel_Category').css('visibility','hidden')
  $('#infoPanel_LastInspect').css('visibility','hidden')
  $('.infoPanel_righthand_vio_rating').css('display','none')

  // console.log(code_correspond_description[id]);
}

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
    context.fillStyle = "#970ac6";
    context.font = "900 19px Miller-DisplayItalic"; //Miller-DisplayItalic
    context.textAlign = "center";
    context.fillText(d.id,d.x,d.y+10);
    // context.moveTo(d.x + 10, d.y);
    // context.arc(d.x, d.y, 10, 0, 2 * Math.PI);
  }
};

function drawNode_button_last_inspect(d) {
  // console.log(data[d.id]);
  if(d.gr == 'r' ){
    if(data[d.id] !== undefined){
      context.beginPath();
      context.moveTo(d.x + 3, d.y);
      context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
      if(data[d.id].violation.color_for_last_inspect){
          context.fillStyle = data[d.id].violation.color_for_last_inspect;
      }else
      {
          context.fillStyle = '#fff'
      }
      context.fill();
      context.strokeStyle = '#1b1f3a'
      context.stroke();
    }
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
    context.fillStyle = "#fff";
    context.font = "900 19px Miller-DisplayItalic"; //Miller-DisplayItalic
    context.fillText(d.id,d.x,d.y+10);
    // context.moveTo(d.x + 10, d.y);
    // context.arc(d.x, d.y, 10, 0, 2 * Math.PI);
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
      .force(  'center', d3.forceCenter(-(width * 0.01),height *0.25))  //-(width*0.05),height *1.65/ 3)
      .force(  'forceX', d3.forceX(1000).x(1000)  )
      .force(  'forceY', d3.forceY(1000)  )
      .force(  'Collision', d3.forceCollide(
          function(d){
            if(d.gr == "v"){
              return 25 //20 for circle
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
    zoom.scaleTo( d3.select(canvas), .5 );
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
      .on('click',clicked)
    /*****************************************************************
    * keyboard control
    *
    * bind keyboard for zoom;
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

    /*****************************************************************
    * button control
    *
    *****************************************************************/
    $('.button_last_inspection_color').each(function(){
      $(this).qtip({
          content: {
              text: $(this).next(".button_last_inspection_color_tooltips")
          },
          position: {
              my: 'center bottom swap',
              at: 'bottom center',
              target: 'mouse',
              adjust: { x: 0, y: 65 }
          },
          show: {
              effect: function() {
                  $(this).fadeTo(200, 1);
              }
          },
          hide: {
              effect: function() {
                $(this).fadeOut(200);
              }
          },
          style: {
              classes: 'qtip-tipsy'
          }
      });
    });

    $('.button_grade_color').each(function(){
      $(this).qtip({
          content: {
              text: $(this).next(".button_grade_color_tooltips")
          },
          position: {
              my: 'center bottom swap',
              at: 'bottom center',
              target: 'mouse',
              adjust: { x: 0, y: 80 }
          },
          show: {
              effect: function() {
                  $(this).fadeTo(200, 1);
              }
          },
          hide: {
              effect: function() {
                $(this).fadeOut(200);
              }
          },
          style: {
              classes: 'qtip-tipsy'
          }
      });
    });

    $( ".button_grade_color").css('background-color','#e96043')
    $( ".button_last_inspection_color" ).click(button_change_color);
    $(".button_grade_color").click(button_default_color)
    function button_change_color(){
      $(this).css('background-color','#e96043');
      $('.button_grade_color').animate({
			     backgroundColor: '#000222'
	    }, 500 );
      // .css('background-color','#000222');
      /* hard coded here, for the performance*/
      var max = 1487998800000,
          min = 1443499200000,
          color_for_last_inspect = d3.scaleLinear()
          .domain([min, max])
          .range(["red", "white"]); //first parameter is the latest inspect, second one is the oldest.
          // .range(["brown", "steelblue"]);
      data.forEach(function(d){
          d.violation.color_for_last_inspect = color_for_last_inspect(Date.parse(d.violation.recentTime));
      });
      toggle_color_for_last_inspect = true;
      ticked();
    }

    function button_default_color(){
      $(this).css('background-color','#e96043');
      $('.button_last_inspection_color').animate({
			     backgroundColor: '#000222'
	    }, 500 );
      toggle_color_for_last_inspect = false;
      ticked();
    }

    function clicked(){

      if(!$(".tgl-skewed").is(':checked')){
        $(".tgl-skewed").prop('checked',true)
      }else{
        $(".tgl-skewed").prop('checked',false)
      }
      if(toggle_mv){
        toggle_mv = false;
      }else if (!toggle_mv) {
        toggle_mv = true;
      }
    }
    /*****************************************************************
    * mousemover event
    *
    *
    *****************************************************************/
    function mv(){
      if(toggle_mv == true){
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
            //here can pass previous data.
            node_associated = removeDuplicates(node_associated,"id");
            if(node_pointed !== undefined) {
              ticked();
              if(node_pointed.gr){
                  if(node_pointed_previous.id !== node_pointed.id){
                    node_pointed_previous = node_pointed;
                    if(node_pointed.gr == 'v'){
                    draw_vio_tooltip(node_pointed);
                    }
                    if(node_pointed.gr == 'r'){
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
          if(node_for_text.id == +node_pointed.id){
            node_for_text = data[+node_pointed.id];
          }
        }
        if(isNaN(+node_pointed.id)){
          if(node_for_violation !== node_pointed.id){
              node_for_violation = node_pointed.id;
              console.log(node_for_violation);
              jquery_vio();
          }
          if(node_for_violation == node_pointed.id){
            node_for_violation = node_pointed.id
          }
        }
      }
    }



  // main fc.
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
    //button for last inspect color
    if(toggle_color_for_last_inspect == true){
      graph.nodes.forEach(drawNode_button_last_inspect);
      // toggle_color_for_last_inspect = false;
    }


      context.restore();
  }
  draw_vio_tooltip(d);
  draw_tooltip_mouseover_r();
}

setup(draw_wheel);

var current_scale;
var button_back_to_wheel = false;
var grid = false, normal = true;
var tick_increment = 0;
mapboxgl.accessToken = 'pk.eyJ1IjoiamlhaGFvMDExMjEiLCJhIjoiY2l6bjI5ZHI1MDJkYzJxbzg1NXJmYWxvMSJ9.AhMpv-yiSAvqlo7bi2UBig';
var map_toggle = true,
	map_setup_toggle = false,
	map_ready = false,
	map;

var graph,
    data,
    code_correspond_description;

var canvas,
    svg,
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

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
}

function jquery(){
  $('#infoPanel_vio_analyze').css('display','none');
  $('#infoPanel_vio_analyze_num').css('display','none');
  $('#infoPanel_vio_code').css('display','none');
  $('#infoPanel_vio_des').css('display','none');
  $('.mousemover_violation').css('display','none');

  $('.dark_side').css('display','block')
  $('.rating').css('display','')
  $('#mapbox').css('display','block')
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
  /*****************************************************************
  * overflow rating;
  *
  * positive
  *****************************************************************/
  d3.select(".rating_list_positive")
    .selectAll('li')
    .remove()

  d3.select('.rating_list_positive')
    .selectAll('li')
    .data(_.where(node_for_text.text,{type:'liked'}))
    .enter()
    .append('li')
    .transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
    .attr('class','rating_pos_item')
    .text(function(d){
        if(d.type == "liked"){
          if(d.text_extract.length == 0){
            return "no key word for this positive review"
          }else{
            return d.text_extract.join(' - ');
          }
        }
    })
    $('#meh_button').click(function(){
        $('#meh_button').css('text-decoration','underline')
        $('#positive_button').css('text-decoration','none')
        $('#negative_button').css('text-decoration','none')
      d3.select(".rating_list_positive")
        .selectAll('li')
        .remove();
console.log("meh");
console.log(node_for_text);
      d3.select('.rating_list_positive')
        .selectAll('li')
        .data(_.where(node_for_text.text,{type:'meh'}))
        .enter()
        .append('li')
        .transition().duration(10/2)
        .style("opacity", 0)
        .transition().duration(1000/2)
        .style("opacity", 1)
        .attr('class','rating_pos_item')
        .text(function(d){
            if(d.type == "meh"){
              if(d.text_extract.length == 0){
                return "no key word for this meh review"
              }else{
                return d.text_extract.join(' - ');
              }
            }
        })
    })
    $('#negative_button').click(function(){
        $('#meh_button').css('text-decoration','none')
        $('#positive_button').css('text-decoration','none')
        $('#negative_button').css('text-decoration','underline')
      d3.select(".rating_list_positive")
        .selectAll('li')
        .remove();
        console.log("negative act");

      d3.select('.rating_list_positive')
        .selectAll('li')
        .data(_.where(node_for_text.text,{type:'disliked'}))
        .enter()
        .append('li')
        .transition().duration(10/2)
        .style("opacity", 0)
        .transition().duration(1000/2)
        .style("opacity", 1)
        .attr('class','rating_pos_item')
        .text(function(d){
            if(d.type == "disliked"){
              if(d.text_extract.length == 0){
                return "no key word for this negative review"
              }else{
                return d.text_extract.join(' - ');
              }
            }
        })
    })
    $('#positive_button').click(function(){

        $('#meh_button').css('text-decoration','none')
        $('#positive_button').css('text-decoration','underline')
        $('#negative_button').css('text-decoration','none')
      d3.select(".rating_list_positive")
        .selectAll('li')
        .remove()

      d3.select('.rating_list_positive')
        .selectAll('li')
        .data(_.where(node_for_text.text,{type:'liked'}))
        .enter()
        .append('li')
        .transition().duration(10/2)
        .style("opacity", 0)
        .transition().duration(1000/2)
        .style("opacity", 1)
        .attr('class','rating_pos_item')
        .text(function(d){
            if(d.type == "liked"){
              if(d.text_extract.length == 0){
                return "no key word for this positive review"
              }else{
                return d.text_extract.join(' - ');
              }
            }
        })
    })



  	/********************************* Map start *********************************/
  	if(tick_increment > 20){
		if(map_toggle){
			$("#map_repleaser").css('display','none')
			 map = new mapboxgl.Map({
			  style: 'mapbox://styles/jiahao01121/cj1trhr1j001y2st2zso35lyp',
			  // attributionControl: false,
			  center: [-73.99746894836426, 40.714183527347096],
			  zoom: 12.366671128219522,
			  pitch: 45,
			  bearing: -17.6,
			  container: 'mapbox'
			});
			map_toggle = false;
			map.on('load', function () {
				console.log("done load base map");
				map_setup_toggle = true;
			})
		}
	}
	if(!map_toggle){
  		if(map_setup_toggle){
  			map.addSource('point', {
  			  "type": "geojson",
  			  "data": {"type": "Point","coordinates": [-73.98605346679688, 40.755222049021405]}
  					});
  			map.addLayer({
  			  "id": "point",
  			  "source": "point",
  			  "type": "circle",
  			  "paint": {
  				  "circle-radius": 3,
  				  "circle-color": "#fff",
  				  "circle-opacity": .8,
  				  "circle-pitch-scale": "map"}
  		  	});
  			map_setup_toggle = false;
  			map_ready = true;
  		};
  	if(map_ready){
  		map.getSource('point').setData({
  			"type": "Point",
  			"coordinates": [node_for_text.lng, node_for_text.lat]});
  		map.flyTo({
  			center: [node_for_text.lng,node_for_text.lat],
  			zoom:12});
  	}
	}
	/********************************* Map end *********************************/
};

function jquery_vio(){
  // console.log(node_for_violation);

  d3.select("#infoPanel_vio_code").transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  $('#infoPanel_vio_code').text("Sanitation Problem Category: "+node_for_violation).css('display' , "inline")
  d3.select("#infoPanel_vio_des").transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  $('#infoPanel_vio_des').text(code_correspond_description[node_for_violation]).css('display','inline');
  d3.select("#infoPanel_vio_analyze").transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  $('#infoPanel_vio_analyze').text("Total number of restaurant contains this sanitation problem:").css('display','inline');
  d3.select("#infoPanel_vio_analyze_num").transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  $('#infoPanel_vio_analyze_num').text(link_associated.length).css('display','block');
  $('.mousemover_violation').css('display','');

/**************************************** restaurant list ************************************************/
var partial;
partial = _.compact(link_associated).splice(0,25);
// console.log(link_associated);
d3.select(".mousemover_violation_list")
  .selectAll('li')
  .remove()
var item = d3.select('.mousemover_violation_list')
  .selectAll('li')
  .data(partial)
  .enter()
  .append('li')
  .transition().duration(10/2)
  .style("opacity", 0)
  .transition().duration(1000/2)
  .style("opacity", 1)
  .attr('class','mousemover_violation_item')
  .text(function(d){ return data[+d.target.id].name } )

  $('#mousemover_violation_button').click(function(){
    d3.select(".mousemover_violation_list")
      .selectAll('li')
      .remove()
    var item = d3.select('.mousemover_violation_list')
      .selectAll('li')
      .data(link_associated)
      .enter()
      .append('li')
      .transition().duration(10/2)
      .style("opacity", 0)
      .transition().duration(1000/2)
      .style("opacity", 1)
      .attr('class','mousemover_violation_item')
      .text(function(d){ return data[+d.target.id].name } )
  })
/**************************************** restaurant list end ************************************************/
  $('#infoPanel_Data_name').css('display','none')
  $('#infoPanel_Location').css('visibility','hidden')
  $('#infoPanel_Category').css('visibility','hidden')
  $('#infoPanel_LastInspect').css('visibility','hidden')
  $('.dark_side').css('display','none')
  $('.rating').css('display','none')
  d3.select("#mapbox").transition().duration(10/2)
    .style("opacity", 0)
    .transition().duration(1000/2)
    .style("opacity", 1)
  $('#mapbox').css('display','none')
  // console.log(code_correspond_description[id]);
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

function zoom_init(arg_k, arg_x, arg_y){
  d3.select(canvas).call(zoom.transform, function () {
    /****** MBP 13" ********/
    // {k: 0.36399738724977154, x: 595.7472039203636, y: 371.8993242226453}
    var k_value = 0.36399738724977154,
        w_value = window.innerWidth / (1440 / 595.7472039203636),
        h_value = window.innerHeight / (748 / 371.8993242226453);
    /****** deckshop" ********/
    if(window.innerHeight > 800 ){
    // {k: 0.48700213427162076, x: 759.3835143163928, y: 483.8403018687343}
      k_value =window.innerHeight / (983 / 0.48700213427162076);
      w_value = window.innerWidth / (1920 / 859.3835143163928);
      h_value = window.innerHeight / (983 / 483.8403018687343);
    };
    if(window.innerHeight > 1100 ){
      k_value = window.innerHeight / (983 / 0.48700213427162076);
      w_value = window.innerWidth / (1920 / 859.3835143163928);
      h_value = window.innerHeight / (983 / 483.8403018687343);
    }
    current_scale = arg_k ? arg_k : k_value;

     return d3.zoomIdentity
       .translate(arg_x ? arg_x : w_value,arg_y ? arg_y : h_value)
       .scale(arg_k ? arg_k : k_value)
  })
}

function setup(cb){

    $('.slide').css('bottom',function(){
      return (window.innerHeight - parseFloat( $(".slide").css("height")) ) * (1-0.618)
    })
    $('#tooltip_wheel').css('bottom',function(){
      return 50;//(window.innerHeight - parseFloat( $(".slide").css("height")) ) * (1-0.618)
    })
    d3.select('body')
    	.append('canvas')
    	.attr('height',window.innerHeight)
      	.attr('width',window.innerWidth)
		.attr('class','main_visual')
      	.canvas(true);
    canvas = document.querySelector('.main_visual');
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
    * search;
    *
    * searching button.
    *****************************************************************/
    function expand() {
      $(".search").toggleClass("close");
      $(".input").toggleClass("square");
      }
      $("#content").submit(function(e) {
          e.preventDefault();
      });
    $('#search_button').on('click', expand);
    /*****************************************************************
    * init wheel position;
    *
    * zoomLevel, position, etc.
    *****************************************************************/
    zoom = d3.zoom()
    	.scaleExtent([.25,1]) //.8
      	.on('zoom',function (){
          transform = d3.event.transform;
          ticked();
      	})
    zoom_init()
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
      .call(zoom)
	  // .on("wheel.zoom", null)
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
		$('.slide').css('right','2rem')
		$('.slide').css('background-color',"rgb(27, 31, 58)")
		$('.slide').css('opacity',"0.92")
		$('.slide').css('box-shadow',"-31px 8px 180px 2px rgba(14, 16, 33, 0.5)")
		$('.mask-on').css('background-color','rgba(0, 0, 0, 0.17)')
		$('.mask-on').css('z-index','1')
		$('.popup_button').css('display','block')

		$('.popup_button').click(function(){
			$('.popup_button').css('display','none')
			$('.mask-on').css('z-index','-1000');
			$('.mask-on').css('background-color','')
			$('.slide').css('right','-23.063rem')
			$('.popup_button').css('display','none')
			$('.slide').css('opacity',"")
			$('.slide').css('box-shadow',"")
			$('.slide').css('background-color',"")
			toggle_mv = true;
			$(".tgl-skewed").prop('checked',false)
		})
		$('.mask-on').click(function() {
  			$('.mask-on').css('z-index','-1000');
			$('.mask-on').css('background-color','')
			$('.slide').css('right','-23.063rem')
			$('.popup_button').css('display','none')
			$('.slide').css('opacity',"")
			$('.slide').css('box-shadow',"")
			$('.slide').css('background-color',"")
			toggle_mv = true;
			$(".tgl-skewed").prop('checked',false)
		});
		Mousetrap.bind(['esc'], function() {
			$('.mask-on').css('z-index','-1000');
	  		$('.mask-on').css('background-color','')
	  		$('.slide').css('right','-23.063rem')
			$('.popup_button').css('display','none')
	  		$('.slide').css('opacity',"")
	  		$('.slide').css('box-shadow',"")
			$('.slide').css('background-color',"")
	  		toggle_mv = true;
	  		$(".tgl-skewed").prop('checked',false)
		});
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
		// console.log("a");
	 if(normal){
      if(toggle_mv == true){
        var p = d3.mouse(this); //coordinates
        var x = d3.event.x;

        /*****************************************************************
        * variable for pass nodes and related links to fc ticked();
          to update and draw those stuff.
        *
        * pushes link_associated & node_associated.
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
                    // draw_vio_tooltip(node_pointed);
                    }
                    if(node_pointed.gr == 'r'){
                    //   draw_tooltip_mouseover_r()
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
            //   console.log(node_for_violation);
              jquery_vio();
          }
          if(node_for_violation == node_pointed.id){
            node_for_violation = node_pointed.id
          }
        }
      }
    }
  }

  // main fc.
  function ticked(g){
	 if(normal){
      context.save();
      context.clearRect(0,0,width,height);
      context.translate(transform.x,transform.y);
      context.scale(transform.k,transform.k);

      if(button_back_to_wheel){
         context.globalAlpha = g;
      }
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
            context.fill();
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



    tick_increment++;
	  function getRandomIntInclusive(min, max) {
	  	min = Math.ceil(min);
	  	max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	  }
	  if(tick_increment > getRandomIntInclusive(20,35)){
		  simulation.stop();
	  }
	}


	  if(grid){
	      context.save();
	      context.clearRect(0,0,width,height);
		    // context.translate(transform.x,transform.y);
	      // context.scale(transform.k,transform.k);

        context.beginPath();

        context.fillStyle = "rgba(255, 255, 255, .2)";
        context.font = "900 30px futura"; //Miller-DisplayItalic
        context.textAlign = "left";
        context.fillText("GRADE: A",graph.nodes[2619+69].x_scatter,graph.nodes[2619+69].y_scatter);
        context.fillText("GRADE: B",graph.nodes[4383+66].x_scatter,graph.nodes[2619+69].y_scatter);
        context.fillText("GRADE: C",graph.nodes[4507+66].x_scatter,graph.nodes[2619+69].y_scatter);
	      graph.nodes.forEach(function(d) {
    	  	  if(d.gr == 'r' ){
                context.beginPath();

    	  	      context.moveTo(d.x_draw + 3 * current_scale-1,
                  d.y_draw
                );
    	  	      context.arc(d.x_draw,
                  d.y_draw,
                  3 * current_scale-1,
                  0,
                  2 * Math.PI
                );

                context.fillStyle = 'rgba(254, 77, 1, 0.3)'
        	      context.fill();

    	  	  }
	  	  });
        context.strokeStyle = "rgba(27, 31, 58,0.575)";
        context.stroke();


	      context.restore();
	  }
  } //ticked


  $('.test').click(function(){
    $(this).children().children().addClass('active')
    // $('.active').animate({
  //  opacity: 0.25,
  //  left: "+=50",
  //  height: "toggle"
 // }, 5000, function() {
   // Animation complete.
 // });

    svg = d3.select('body').append('svg').attr('class','sub_visual')
      .attr('width',width)
      .attr('height',height)

    $('#tooltip_wheel').css('display','none')
    $('#tooltip_plot_grade_rating')
      .css('display','block')
      .css('left',window.innerWidth - 400 - $('#tooltip_plot_grade_rating').width())
      .css('bottom',function(){return 50 });
    /********************************** compute scatter plot ****************************************/
	  var vio_s = graph.nodes.map(function(d){if(!isNaN(+d.id)){ return data[+d.id].violation.recentScore;}});
	  vio_s.splice(0,78);
	  var vio_s_max = d3.max(vio_s)
	  var vio_s_min = d3.min(vio_s)


	  var rate = graph.nodes.map(function(d){if(!isNaN(+d.id)){return data[+d.id].rating;}});
	  rate.splice(0,78);
	  var rate_max = d3.max(rate)
	  var rate_min = d3.min(rate)
	  var linearScaleX = d3.scaleLinear()
      .domain([vio_s_min,vio_s_max])
      .range([150 + 25, window.innerWidth - 400]);
	  var linearScaleY = d3.scaleLinear()
      .domain([rate_max,rate_min])
      .range([0 + 35, window.innerHeight - 35]);
    graph.nodes.forEach(function(d){
	    if(d.gr == "r"){
		    d.x_draw = 0;
    	  d.y_draw = 0;
        d.x_scatter = linearScaleX(data[+d.id].violation.recentScore);
        d.y_scatter = linearScaleY(data[+d.id].rating);
	    }
    });

    var gx = svg.append('g')
      .attr('class','axis')
      .attr("transform", "translate(0," + (window.innerHeight -25) + ")")
      .call(customXAxis)
    function customXAxis(g) {
        g.call(d3.axisTop(linearScaleX)
            .tickValues([13, 27])
              );
        g.selectAll('.tick line').attr('y2','-'+(window.innerHeight -70)).attr("stroke-dasharray", "2,10").style('z-index',3);
        g.selectAll(".tick text").attr("x", 10).attr("dy", 4);

        g.append('text')
          .attr('y',15)
          .attr('x',parseFloat(g.select('path').attr('d').match(/[^M].+,/g)))
          .attr('text-anchor','start')
          .style('font-size','0.558rem')
          .text('Sanitation Score')
      }

    var gy = svg.append('g')
      .attr('id','axis_y')
      .attr("transform", "translate("+165 +",0)")
      .call(customYAxis)
    function customYAxis(g){
        g.select(".domain").remove();
        g.call(d3.axisLeft(linearScaleY))
        g.selectAll(".tick text").attr("y", -10).attr("x", 0).style('font-size','.438rem');

        g.select('.tick')
          .append('text')
          .attr('y',g.select('.tick').select('text').attr('y') -25)
          .attr('x',g.select('.tick').select('line').attr('x2'))
          .attr('dy','0.32em')
          .attr('text-anchor','start')
          .style('font-size','0.558rem')
          .text('Foursquare Rating')
      }
    /***************************************** animation *******************************************/
    current_scale = transform.k
    var timer = d3.timer(function(e){

      var scale = Math.min(1,d3.easeQuadInOut(e/2000) + current_scale);

      zoom_init(scale, transform.x, transform.y)

      if(scale == 1){
        // current_scale = 1;
        timer.restart(function(e){
          normal = false;
          grid = true;
          var t = Math.min(1,d3.easeCubicOut(e/1500));

          graph.nodes.forEach(function(d){
            d.x_draw = ((transform.x +  d.x) / transform.k) * (1-t) + d.x_scatter * t
            d.y_draw = ((transform.y +  d.y) / transform.k) * (1-t) + d.y_scatter * t
          });
          ticked();
          if (t === 1) {
            timer.stop();
          }
        })
      }
    })
    /***************************************** find *******************************************/
    var tree = d3.quadtree()
      .extent([[0, 0], [window.innerWidth, window.innerHeight]])
      .x(function(d) { return d.x_scatter})
      .y(function(d) { return d.y_scatter})
      .addAll(graph.nodes);
      if(d3.select('.temporary')._groups[0][0] == null){
        d3.select('body')
            .append('canvas')
            .attr('height',window.innerHeight)
            .attr('width',window.innerWidth)
            .attr('class','temporary')
            .canvas(true);
        var canvas_temp = document.querySelector('.temporary');
        var context_temp = canvas_temp.getContext('2d');
      }
    /***************************************** second canvas *******************************************/
    var featured_point=[];
    d3.select('.temporary').on('mousemove',grid_mv);
    d3.select('.temporary').on('click',grid_click);
    var p_prev = {id: "arbitrary"};
    var clicked = true;
    function grid_mv(){
        clicked = true;
        featured_point=[];
    	  var m = d3.mouse(this),
    	      p = tree.find(m[0], m[1]);
        if(p_prev.id !== p.id){
          p_prev = p;
          node_for_text = data[+p.id];
          jquery();
          console.log("prev !== next");
          (function(){
            var use = _.sortBy(_.sortBy(graph.nodes,'x_draw'),'y_draw');
            var i = 0;
            var count = 0;
            var toggle_loop = true;
            use.forEach(function(d){
              if(d.y_scatter == p.y_scatter){
                if(d.x_scatter == p.x_scatter){
                  featured_point.push(d);
                  i+=25;
                  count++;
            }}})

            var timer_ease = d3.timer(function(e){

              var ease = Math.min(1,d3.easePolyOut(e/500,4));

              context_temp.save();
              context_temp.clearRect(0,0,width,height);


              var interval = 0;
              featured_point.forEach(function(d){
                  context_temp.beginPath();
                  context_temp.moveTo( (d.x_draw  + interval *25 )*ease + d.x_draw * (1-ease),
                    d.y_draw
                  );
                  context_temp.arc((d.x_draw  + interval *25)*ease + d.x_draw * (1-ease),
                    d.y_draw,
                    7*ease + 3* (1-ease) ,
                    0,
                    2 * Math.PI
                  );
                  context_temp.fillStyle = 'rgba(254, 77, 1, .8)'
                  context_temp.fill();
                  interval++;
              })
              if(count >= 2){
                context_temp.globalCompositeOperation = 'destination-over'
                context_temp.fillStyle = "rgba(255, 255, 255,.7)";
                roundRect(context_temp,
                  p.x_scatter + 7.5,
                  p.y_scatter - 15,
                  (i-25 +7.5) * ease + 50* (1-ease),
                  30,
                  20,
                  true);
              }
              context_temp.restore();

              if(ease == 1){
                console.log("stop");
                timer_ease.stop();
              }
              toggle_loop = false;
            })

          })()

        }
        if(p_prev.id == p.id){
          console.log("prev = next");
          node_for_text = data[+p.id];
          (function(){
            var use = _.sortBy(_.sortBy(graph.nodes,'x_draw'),'y_draw');
            var i = 0;
            var count = 0;
            var toggle_loop = true;
            use.forEach(function(d){
              if(d.y_scatter == p.y_scatter){
                if(d.x_scatter == p.x_scatter){
                  featured_point.push(d);
                  i+=25;
                  count++;
            }}})
            context_temp.save();
            context_temp.clearRect(0,0,width,height);
            var interval = 0;
            featured_point.forEach(function(d){
                context_temp.beginPath();
                context_temp.moveTo( (d.x_draw  + interval *25 ),
                  d.y_draw
                );
                context_temp.arc((d.x_draw  + interval *25),
                  d.y_draw,
                  7 ,
                  0,
                  2 * Math.PI
                );
                context_temp.fillStyle = 'rgba(254, 77, 1, .8)'
                context_temp.fill();
                interval++;
            })
            if(count >= 2){
              context_temp.globalCompositeOperation = 'destination-over'
              context_temp.fillStyle = "rgba(255, 255, 255,.7)";
              roundRect(context_temp,
                p.x_scatter + 7.5,
                p.y_scatter - 15,
                (i-25 +7.5),
                30,
                20,
                true);
            }
            context_temp.restore();
          })()
        }
    }



    function grid_click(){

      if(clicked){
        var dig_data = featured_point,
            interval_ = 0;
            loop_once = true,
            pointed_prev = {id:"arbitrary"};

            $('.slide').css('right','2rem')
        		$('.slide').css('background-color',"rgb(27, 31, 58)")
        		$('.slide').css('opacity',"0.92")
        		$('.slide').css('box-shadow',"-31px 8px 180px 2px rgba(14, 16, 33, 0.5)")
            $('.popup_button').css('display','block')
            $('.popup_button').css('z-index',10)

            d3.select('.temporary').on('mousemove',function(){
              var m = d3.mouse(this),
                  minDistance = Infinity;
              if(loop_once){
                  dig_data.forEach(function(d){
                      d.x_draw_temp = d.x_draw  + (interval_ *25);

                      interval_++;
                  })
                  loop_once = false;
              }
              dig_data.forEach(function(d){
                var dx = d.x_draw_temp - m[0];
                var dy = d.y_draw - m[1];
                var distance = Math.sqrt((dx * dx) + (dy * dy));
                // console.log(distance);
                if(distance < minDistance && distance < 7){
                    if(pointed_prev.id !== d.id){
                      node_for_text = data[+d.id];
                      jquery();
                      pointed_prev = d;
                    }
                    if(pointed_prev.id !== d.id){
                      node_for_text = data[+d.id];
                    }
                }
              })
            });

            var timer_ease_c = d3.timer(function(e){
              var ease_v = Math.min(1,d3.easeBackInOut(e/800));
              var ease_color = d3.scaleQuantile()
              .domain([0, 1])
              .range(['rgba(254, 77, 1, .8)', 'rgba(127, 235, 255, .8)']);
              context_temp.save();
              context_temp.clearRect(0,0,width,height);
              dig_data.forEach(function(d,i){
                    context_temp.beginPath();
                    context_temp.moveTo( (d.x_draw  + i *(25*(1-ease_v) + 30*ease_v ) ),
                          d.y_draw
                        );
                    context_temp.arc((d.x_draw  + i *(25*(1-ease_v) + 30*ease_v )),
                          d.y_draw,
                          9*ease_v + 7*(1-ease_v),
                          0,
                          2 * Math.PI
                        );
                    context_temp.fillStyle = ease_color(parseFloat(ease_v));
                    context_temp.fill();
              })
              if(dig_data.length >= 2){
                context_temp.globalCompositeOperation = 'destination-over'
                context_temp.fillStyle = "rgba(255, 255, 255,.7)";
                roundRect(context_temp,
                  dig_data[0].x_scatter + (7.5*(1-ease_v) + 9*ease_v),
                  dig_data[0].y_scatter - (15*(1-ease_v) + 20*ease_v ),
                  ((30*dig_data.length) -30 +7.5),
                  40*ease_v + 30 *(1-ease_v),
                  20*(1-ease_v) + 25*ease_v,
                  true);
              }
              context_temp.fillStyle = "#ffffff";
              context_temp.font = "900 12px futura";
              context_temp.textAlign = "center";
              // context.moveTo(((30*dig_data.length) -30 +7.5) / 2,dig_data[0].y_scatter - 20)
              context_temp.fillText(
                "Total Restaurant here: "+dig_data.length,
                dig_data[0].x_scatter +9 + ((((30*dig_data.length) -30 +7.5) ) / 2),
                dig_data[0].y_scatter + 40
              );
              context_temp.font = "900 9px futura";

              context_temp.fillText(
                "Sanitation Score: "+ data[+dig_data[0].id].violation.recentScore,
                dig_data[0].x_scatter +9 + ((((30*dig_data.length) -30 +7.5) ) / 2),
                dig_data[0].y_scatter + 70
              );
              context_temp.font = "900 9px futura";

              context_temp.fillText(
                "Foursquare Rating: "+ data[+dig_data[0].id].rating,
                dig_data[0].x_scatter +9 + ((((30*dig_data.length) -30 +7.5) ) / 2),
                dig_data[0].y_scatter + 90
              );
              context.closePath();


              context_temp.restore();
              if(ease_v ==1){
                  timer_ease_c.stop();
              }
            })
      }
      if(!clicked){
        d3.select('.temporary').on('mousemove',grid_mv)
        context_temp.clearRect(0,0,width,height)
        $('.slide').css('right','-23.063rem')
  			$('.popup_button').css('display','none')
  			$('.slide').css('opacity',"")
  			$('.slide').css('box-shadow',"")
  			$('.slide').css('background-color',"")
      }
      clicked = false;

    }
  }); //button_grid



  $('.test_two').click(function(){
    $('#plot_rating').removeClass('active')
    $('#tooltip_wheel').css('display','block')
    $('#tooltip_plot_grade_rating').css('display','none')
    d3.selectAll('.temporary').remove();
    d3.selectAll('.sub_visual').remove();

   zoom_init();
   current_scale = 1;
   var timer = d3.timer(function(e){
       var t = Math.min(1,d3.easeCubicIn(e/2000));
       graph.nodes.forEach(function(d){
        d.x_draw = ((d.x) / transform.k) * (t) + d.x_scatter * (1-t)
        d.y_draw = (( d.y) / transform.k) * (t) + d.y_scatter * (1-t)
      });
      ticked();
       if (t === 1) {
        timer.stop();
         normal = true;
         grid = false;
         button_back_to_wheel = true;
         var ticking_timerss = d3.timer(function(elep){
          var alpha = Math.min(1,d3.easeCubicIn(elep/500));
          ticked(alpha);
          if(alpha == 1){
            button_back_to_wheel = false;
            ticking_timerss.stop();
            ticked();
          }
         })
       }
 })
   select_canvas.on('mousemove',mv);



 });




}

setup(draw_wheel);

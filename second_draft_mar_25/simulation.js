// var Simulation = function(){
//   this.simulator = d3.forceSimulation()
//     .force(  'link', d3.forceLink().id(function(d){ return d.id;})  )
//     .force(  'charge', d3.forceManyBody().strength(-140).distanceMax(202).distanceMin(function(d){ return d3.randomUniform(3000)()})  )
//     .force(  'center', d3.forceCenter(-(width*0.05),height *1.65/ 3)  )
//     .force(  'forceX', d3.forceX(1000).x(1000)  )
//     .force(  'forceY', d3.forceY(1000)  )
//     .force(  'Collision', d3.forceCollide(
//       function(d){
//         if(d.gr == "v"){
//           return 20
//         }else{ return null}
//       })
//     )
//     .alpha(  .05  )
//     .velocityDecay(  0.2  )
//     // .stop();
//     this.test = 11;
//     this.bindSimulator;
// }
//
// Simulation.prototype.init_simulation = function(nodes,links,ticked){
//   // console.log(this.test)
//
//   this.simulator
//       .nodes(nodes)
//       .on('tick',ticked);
//   this.simulator.force('link')
//       .links(links)
//       .distance(800);
//   this.bindSimulator = this.simulator;
// }
// //
// // Simulation.prototype.ticked = function(){
// //
// //       context.save();
// //       context.clearRect(0,0,width,height);
// //
// //       context.translate(transform.x,transform.y);
// //       context.scale(transform.k,transform.k);
// //       //interaction link
// //       if(link_associated.length !== 0){
// //           context.beginPath();
// //           link_associated.forEach(drawLink)
// //
// //           context.strokeStyle = "rgba(151, 10, 198,0.575)";
// //           context.stroke();
// //       }
// //       //central vio point
// //       context.beginPath();
// //       graph.nodes.forEach(drawNode_inspc);
// //       context.fillStyle = '#970ac6';
// //       context.fill();
// //       context.strokeStyle = '#1b1f3a';
// //       context.lineWidth =.5;
// //       context.stroke();
// //       //restaurant point
// //       context.beginPath();
// //       graph.nodes.forEach(drawNode_restaurant_A);
// //       context.fillStyle = '#cd772c'
// //       context.fill();
// //       context.strokeStyle = '#1b1f3a'
// //       context.stroke();
// //
// //       context.beginPath();
// //       graph.nodes.forEach(drawNode_restaurant_B);
// //       context.fillStyle = '#297aef'
// //       context.fill();
// //       context.strokeStyle = '#1b1f3a'
// //       context.stroke();
// //
// //       context.beginPath();
// //       graph.nodes.forEach(drawNode_restaurant_C);
// //       context.fillStyle = '#2aff50'
// //       context.fill();
// //       context.strokeStyle = '#1b1f3a'
// //       context.stroke();
// //       //interaction nodes
// //       if(node_pointed){
// //           context.beginPath();
// //           drawNode_interact(node_pointed)
// //       }
// //       if(node_associated.length !== 0){
// //           context.beginPath();
// //           node_associated.forEach(drawNode_interact);
// //           context.fillStyle = '#ffffff';  //"#09f2bf"
// //           context.fill();
// //       }
// //       context.restore();
// //   }
//
// // var test = new Simulation();
// // test.init_simulation();
// var a = [1,2,3]
// a.splice(0,1)
// console.log(a);

 var a  =Date.parse( "2017-01-24T05:00:00.000Z");
var b = Date.now()
 // console.log(Date.parse(a))
console.log(b -a);

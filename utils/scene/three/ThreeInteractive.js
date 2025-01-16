import THREE from "./three";

//
export default class ThreeInteractive extends THREE.EventDispatcher{

  #raycasterTarget = new THREE.Vector2();

  renderer;
  camera;
  mouseMoved = false;
  mousePressed = false;
  mouseCoords = new THREE.Vector2();
  mouseCoordsPrev = new THREE.Vector2();
  mouseCoordsDelta = new THREE.Vector2();
  mouseDOMCoords = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  useTouchOnly = false;

  ///
  constructor( renderer, camera, _attach ) {

    super();

    console.log('ThreeInteractive', renderer, camera, _attach );

    this.renderer = renderer;
    this.camera = camera;

    if( _attach ) this.attach();

  }


  //
  attach(){
    const DOMTarget = this.renderer.domElement;
    if( !DOMTarget ) return;
    DOMTarget.addEventListener( 'mousedown', this.onMouseDown, { passive: false } );
    DOMTarget.addEventListener( 'mouseup', this.onMouseUp, { passive: false } );
    DOMTarget.addEventListener( 'mousemove', this.onMouseMove, { passive: false } );
    DOMTarget.addEventListener( 'mouseout', this.onMouseOut, { passive: false } );
    DOMTarget.addEventListener( 'touchstart', this.onTouchStart, false, { passive: false } );
    DOMTarget.addEventListener( 'touchend', this.onTouchEnd, { passive: false } );
    DOMTarget.addEventListener( 'touchmove', this.onTouchMove, false, { passive: false } );
  }

  //
  detach(){ // TODO: Implement detaching

  }


  //
  setMouseCoords = ( x, y, updatePrev ) => {

    const { renderer, mouseDOMCoords, mouseCoords, mouseCoordsPrev, mouseCoordsDelta } = this;

    mouseDOMCoords.set(x,y);
    if( updatePrev ) mouseCoordsPrev.copy( mouseCoords );
    mouseCoords.set( ( x / renderer.domElement.clientWidth ) * 2 - 1, - ( y / renderer.domElement.clientHeight ) * 2 + 1 );
    if( updatePrev ) {
      mouseCoordsDelta.x = mouseCoords.x - mouseCoordsPrev.x;
      mouseCoordsDelta.y = mouseCoords.y - mouseCoordsPrev.y;
    }else{
      mouseCoordsPrev.copy(mouseCoords);
      mouseCoordsDelta.set(0,0);
    }
    this.mouseMoved = true;
  };

  setMousePos( mx, my, eventName, updatePrev ){
    const {mouseCoords} = this;
    this.setMouseCoords( mx, my, updatePrev );
    this.dispatchEvent({
      type: eventName,
      message:[mx,my,mouseCoords.x,mouseCoords.y]
    });
  }

  // MOUSE
  onMouseDown = ( event )  => {
    this.mousePressed = true;
    this.mouseJustPressed = true;
    this.setMousePos( event.pageX, event.pageY, 'pointerdown' );
  };

  onMouseUp = ( event ) => {
    this.mousePressed = false;
    this.setMousePos( event.pageX, event.pageY, 'pointerup' );
  };

  onMouseOut = ( event ) => {
    this.mousePressed = false;
    this.setMousePos( event.pageX, event.pageY, 'pointerout' );
  };

  onMouseMove = ( event ) => {
    this.setMousePos( event.pageX, event.pageY, 'pointermove', true );
  };


  // TOUCH
  onTouchStart = ( event ) => {
    if ( event.touches.length === 1 ) {
      // event.preventDefault();
      event.stopPropagation();
      this.mousePressed = true;
      this.mouseJustPressed = true;
      this.setMousePos( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 'pointerdown' );
    }
  };

  onTouchEnd = ( event ) => {
    this.mousePressed = false;
    // console.log('END',event);
    this.setMousePos( event.changedTouches[ 0 ].pageX, event.changedTouches[ 0 ].pageY, 'pointerup' );
  };

  onTouchMove = ( event ) => {
    if ( event.touches.length === 1 ) {
      // event.preventDefault();
      event.stopPropagation();
      this.setMousePos( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 'pointermove' );
    }

    if( !this.useTouchOnly ) this.setTouchOnly(); // Remove Mouse Listeners if touch is enabled

  };

  setTouchOnly = () => {
    this.useTouchOnly = true;
    const DOMTarget = this.renderer.domElement;
    if( !DOMTarget ) return;
    DOMTarget.removeEventListener( 'mousedown', this.onMouseDown );
    DOMTarget.removeEventListener( 'mouseup', this.onMouseUp );
    DOMTarget.removeEventListener( 'mousemove', this.onMouseMove );
    DOMTarget.removeEventListener( 'mouseout', this.onMouseOut );
  };

  updateRayCaster( x, y, getPixels ){

    const { renderer, camera, mouseCoords, raycaster } = this;

    if( x !== undefined ){
      this.#raycasterTarget.x = !getPixels ? x : ( x / renderer.domElement.clientWidth ) * 2 - 1;
      this.#raycasterTarget.y = !getPixels ? y : - ( y / renderer.domElement.clientHeight ) * 2 + 1;
      // console.log('!', this.#raycaster_target ); // !!!
      raycaster.setFromCamera( this.#raycasterTarget, camera );
    }else{
      raycaster.setFromCamera( mouseCoords, camera );
    }

  }

}

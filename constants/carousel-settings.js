export const settings = {
  default : {
    slidesPerView: "auto",
    centeredSlides: true,
    loop: true,
    spaceBetween: 0,
    allowTouchMove: true
  },

  onMethodsExample: {
    onInit: function () {
      console.log("функция с новым onInit");
    },
    onSlideChange: function (swiper, readIndex, arrayLength) {
      console.log("Получить данные", swiper, readIndex, arrayLength);
    }
  },

  customPaginationExample: {
    slidesPerView: "auto",
    centeredSlides: true,
    loop: true,
    pagination: {
      clickable: true,
      renderBullet: function (index, className) {
        return '<div class=\"' + className + '\"><p>' + index + '</p></div>';
      }
    }
  }

}

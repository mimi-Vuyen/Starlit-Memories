/* Dữ liệu khung cho các ký ức ở những phase sau; chưa có nội dung cá nhân. */
(function () {
  "use strict";

  window.StarlitMemories = window.StarlitMemories || {};
  window.StarlitMemories.memories = Array.from({ length: 9 }, function (_, index) {
    return {
      id: index + 1,
      title: "",
      message: "",
      image: null
    };
  });
})();

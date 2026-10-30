/* Edit memory text and image paths here; Star 09 is reserved for the final wish. */
(function () {
  "use strict";

  window.StarlitMemories = window.StarlitMemories || {};
  window.StarlitMemories.memories = [
    {
      id: 1,
      image: "assets/images/memory-star1.jpg",
      caption: "Một khoảnh khắc dịu dàng",
      title: "Vào một ngày mùa đông năm ấy",
      message: "Có những buổi chiều chẳng cần điều gì đặc biệt — chỉ cần được ở cạnh nhau, nghe sóng khẽ vỗ và ngắm bầu trời chậm rãi đổi màu.",
      alt: "Minh họa bầu trời chạng vạng bên bờ biển yên bình"
    },
    {
      id: 2,
      image: "assets/images/memory-sample.svg",
      caption: "Một khoảnh khắc đáng nhớ",
      title: "Ký ức 02",
      message: "Nội dung sẽ được bổ sung sau.",
      alt: "Ảnh tạm thời cho ký ức thứ hai: bầu trời hoàng hôn bên biển"
    },
    {
      id: 3,
      image: "assets/images/memory-sample.svg",
      caption: "Những ngày bình yên",
      title: "Ký ức 03",
      message: "Nội dung sẽ được bổ sung sau.",
      alt: "Ảnh tạm thời cho ký ức thứ ba: bầu trời hoàng hôn bên biển"
    },
    {
      id: 4,
      image: "assets/images/memory-sample.svg",
      caption: "Một nụ cười",
      title: "Ký ức 04",
      message: "Nội dung sẽ được bổ sung sau.",
      alt: "Ảnh tạm thời cho ký ức thứ tư: bầu trời hoàng hôn bên biển"
    },
    {
      id: 5,
      image: "assets/images/memory-sample.svg",
      caption: "Chuyện chưa kể",
      title: "Ký ức 05",
      message: "Nội dung sẽ được bổ sung sau.",
      alt: "Ảnh tạm thời cho ký ức thứ năm: bầu trời hoàng hôn bên biển"
    },
    {
      id: 6,
      image: "assets/images/memory-sample.svg",
      caption: "Dưới bầu trời sao",
      title: "Ký ức 06",
      message: "Nội dung sẽ được bổ sung sau.",
      alt: "Ảnh tạm thời cho ký ức thứ sáu: bầu trời hoàng hôn bên biển"
    },
    {
      id: 7,
      image: "assets/images/memory-sample.svg",
      caption: "Những điều nhỏ bé",
      title: "Ký ức 07",
      message: "Nội dung sẽ được bổ sung sau.",
      alt: "Ảnh tạm thời cho ký ức thứ bảy: bầu trời hoàng hôn bên biển"
    },
    {
      id: 8,
      image: "assets/images/memory-sample.svg",
      caption: "Điều muốn giữ lại",
      title: "Ký ức 08",
      message: "Nội dung sẽ được bổ sung sau.",
      alt: "Ảnh tạm thời cho ký ức thứ tám: bầu trời hoàng hôn bên biển"
    }
  ];
  window.StarlitMemories.finalWish = {
    title: "Chúc mừng sinh nhật, Tỷ tỷ.",
    subtitle: "",
    message: "Nội dung lời chúc sẽ được bổ sung sau.",
    signature: "Giữa muôn vàn vì sao, vẫn có một ánh sáng dành riêng cho Tỷ.",
    wishes: [
      { id: "wish-01", image: "assets/images/memory-star1.jpg", message: "Lời chúc nhỏ sẽ được bổ sung sau.", duration: 12000 },
      { id: "wish-02", image: "assets/images/memory-sample.svg", message: "Một điều dịu dàng đang chờ được viết nên.", duration: 13000 },
      { id: "wish-03", image: "assets/images/memory-sample.svg", message: "Lời chúc nhỏ sẽ được bổ sung sau.", duration: 14000 },
      { id: "wish-04", image: "assets/images/memory-sample.svg", message: "Một điều dịu dàng đang chờ được viết nên.", duration: 12500 },
      { id: "wish-05", image: "assets/images/memory-sample.svg", message: "Lời chúc nhỏ sẽ được bổ sung sau.", duration: 15000 },
      { id: "wish-06", image: "assets/images/memory-sample.svg", message: "Một điều dịu dàng đang chờ được viết nên.", duration: 13500 },
      { id: "wish-07", image: "assets/images/memory-sample.svg", message: "Lời chúc nhỏ sẽ được bổ sung sau.", duration: 14500 },
      { id: "wish-08", image: "assets/images/memory-sample.svg", message: "Một điều dịu dàng đang chờ được viết nên.", duration: 13000 }
    ]
  };
})();

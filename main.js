const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Beat It",
      singer: "Michael Jackson",
      path: "./assets/music/beat_it.mp3",
      image: "./assets/img/beat_it.jpg",
    },
    {
      name: "Attention",
      singer: "Charlie Puth",
      path: "./assets/music/attention.mp3",
      image: "./assets/img/attention.jpg",
    },
    {
      name: "Natural",
      singer: "Imagine Dragons",
      path: "./assets/music/natural.mp3",
      image: "./assets/img/natural.jpg",
    },
    {
      name: "Chery Chery Lady",
      singer: "Modern Talking",
      path: "./assets/music/Chery_chery_lady.mp3",
      image: "./assets/img/Chery_chery_lady.jpg",
    },
    {
      name: "Lối Nhỏ",
      singer: "Đen Vâu",
      path: "./assets/music/loinho.mp3",
      image: "./assets/img/loi_nho.jpg",
    },
    {
      name: "Em Gì Ơi",
      singer: "J97",
      path: "./assets/music/emgioi.mp3",
      image: "./assets/img/em_gi_oi.jpg",
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htms = this.songs.map((song, index) => {
      return `
            <div class="song ${
              index === this.currentIndex ? "active" : ""
            }"  data-index=${index}>
              <div class="thumb" style="background-image: url('${song.image}')">
              </div>
              <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
              </div>
              <div class="option">
                <i class="fas fa-ellipsis-h"></i>
              </div>
            </div>
          `;
    });
    playList.innerHTML = htms.join("");
  },
  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    const cdWidth = cd.offsetWidth;

    // Xử lý cd quay/dừng
    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        duration: 10000, //10 seconds
        iterations: Infinity,
      }
    );

    cdThumbAnimate.pause();
    // Xử lý khi cuộn
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;

      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý khi play
    playBtn.onclick = function () {
      if (app.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };
    // Khi bài hát được play
    audio.onplay = function () {
      app.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi bài hát bị pause
    audio.onpause = function () {
      app.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Xử lý khi tua bài hát
    progress.oninput = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
      audio.play();
    };

    // Khi next
    nextBtn.onclick = function () {
      if (app.isRandom) {
        app.playRandomSong();
      } else {
        app.nextSong();
      }
      audio.play();
      app.render();
      app.scrollToActiveSong();
    };

    // Khi prev
    prevBtn.onclick = function () {
      if (app.isRandom) {
        app.playRandomSong();
      } else {
        app.prevSong();
      }
      audio.play();
      app.render();
      app.scrollToActiveSong();
    };

    // Xử lý bật/tắt random
    randomBtn.onclick = function (e) {
      app.isRandom = !app.isRandom;
      app.setConfig("isRandom", app.isRandom);
      randomBtn.classList.toggle("active", app.isRandom);
    };

    // Xử lý lặp lại bài hát
    repeatBtn.onclick = function (e) {
      app.isRepeat = !app.isRepeat;
      app.setConfig("isRepeat", app.isRepeat);
      repeatBtn.classList.toggle("active", app.isRepeat);
    };

    // Xử lý next khi song ended
    audio.onended = function () {
      if (app.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Lắng nghe hành vi click vào playlist
    playList.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");

      if (songNode || e.target.closest(".option")) {
        //  Xử lý khi click vào bài hát
        if (songNode) {
          app.currentIndex = Number(songNode.dataset.index);
          app.loadCurrentSong();
          app.render();
          audio.play();
        }

        // Xử lý khi click vào option
        if (e.target.closest(".option")) {
        }
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      if (this.currentIndex <= 3) {
        $(".song.active").scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      } else {
        $(".song.active").scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);

    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },

  start: function () {
    // Gán cấu bhinhf từ config vào ứng dụng
    this.loadConfig();

    // Định nghĩa các thuộc tính cho object
    this.defineProperties();

    // Lắng nghe và xử lý các sự kiện
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên và UI khi ứng dụng được chạy
    this.loadCurrentSong();

    // Render playlist
    this.render();

    // Hiển thị trạng thái ban đầu của button random và repeat
    randomBtn.classList.toggle("active", app.isRandom);
    repeatBtn.classList.toggle("active", app.isRepeat);
  },
};

app.start();

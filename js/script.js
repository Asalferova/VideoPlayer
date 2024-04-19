'use strict';

const videos = [
    {
        "src": "./video/1.mp4",
        "desc": "Погружение в удивительный мир дикой природы, где величественные горы встречаются с бескрайними лесами, создавая потрясающие пейзажи и уникальные моменты спокойствия.",
        "title": "Природные симфонии: Вдохновляющие пейзажи и звуки дикой природы"
    },
    {
        "src": "./video/9.mp4",
        "desc": "Подарите себе уникальный опыт наблюдения за закатами над океаном, плавным течением рек и таинственными лесными тропами, вдохновляющими на новые открытия.",
        "title": "Природные сокровища: Откройте тайны и уникальность природных богатств"
    },

    {
        "src": "./video/5.mp4",
        "desc": "Исследуйте мир растений, расцветающих в ярких красках и создающих потрясающие пейзажи, напоминающие о величии и красоте природы.",
        "title": "Природная гармония: Слияние красоты и спокойствия в дикой природе"
    },

    {
        "src": "./video/7.mp4",
        "desc": "Путешествие сквозь времена и пространства, позволяющее увидеть эволюцию природы и ее великолепие, открывая новые грани красоты и гармонии.",
        "title": "Природные вдохновения: Источник вдохновения и красоты в природе"
    },
];

const PER_PAGE = 5;

// Объект, который имитирует сервер и содержит метод getVideos. Этот метод используется для получения видео с “сервера”. В реальности он просто возвращает часть массива videos, начиная с определенного индекса. Индекс определяется на основе текущей страницы (page), которую мы хотим загрузить. Это имитирует пагинацию данных на реальном сервере.
const server = {
    getVideos(page = 1) {
        const offset = (page - 1) * PER_PAGE;
        const paginatedItems = videos.slice(offset, offset + PER_PAGE);
        const hasNextPage = videos.length > offset + PER_PAGE;
        return new Promise((resolve) => {
            setTimeout(() => resolve({ videos: paginatedItems, nextPage: hasNextPage ? page + 1 : null }), 150);
        });
    },
};

// Это функция, которая принимает другую функцию (callee) и время ожидания (timeout) в миллисекундах. Она возвращает новую функцию, которая, когда вызывается, будет вызывать callee, но не чаще, чем раз в timeout миллисекунд. Это необходимо для предотвращения слишком частых вызовов функции при обработке событий прокрутки или изменения размера окна.
function throttle(callee, timeout) {
    let timer = null
    return function perform(...args) {
        if (timer) return

        timer = setTimeout(() => {
            callee(...args)
            clearTimeout(timer)
            timer = null
        }, timeout)
    }
};

class VideoPlayer {
    constructor(videos) {
        // Инициализация элементов DOM
        this.videos = [...videos]
        this.videoContainer = document.querySelector('.video-player__container');
        this.videoMain = document.querySelector('.video-player__main');
        this.videoTitle = document.querySelector('.video-player__title');
        this.videoDesc = document.querySelector('.video-player__desc');
        this.play = document.querySelector('.video-player__play');
        this.pause = document.querySelector('.fa-pause');
        this.volumeValue = document.querySelector('.video-player__volume');
        this.noVolume = document.querySelector('.fa-volume-xmark');
        this.videoRange = document.querySelector('.video-player__range');
        this.volumeRange = document.querySelector('.video-player__volume-range');
        this.clockSpan = document.querySelector('.fa');
        this.expandScreen = document.querySelector('.video-player__expand');
        this.moreSpeed = document.querySelector('.fa-solid.fa-forward-fast');
        this.nextVideo = document.querySelector('.fa-solid.fa-forward-step');
        this.currentVideoIndex = 0;

        // Инициализация обработчиков событий
        this.initEventHandlers();
    }

    //Инициализирует обработчики событий для элементов видеоплеера
    initEventHandlers() {
        // Обработчики событий
        this.play.addEventListener('click', () => this.togglePlayPause());
        this.videoMain.addEventListener('click', () => this.togglePlayPause());
        this.moreSpeed.addEventListener('click', () => {
            this.videoMain.playbackRate += 0.5;
        });
        this.expandScreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                if (this.videoContainer.requestFullscreen) {
                    this.videoContainer.requestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });
        this.videoMain.addEventListener('timeupdate', () => {
            const hours = Math.floor(this.videoMain.currentTime / 3600);
            const minutes = Math.floor((this.videoMain.currentTime % 3600) / 60);
            const seconds = Math.floor(this.videoMain.currentTime % 60);
            this.clockSpan.innerText = hours >= 1 ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            this.videoRange.value = this.videoMain.currentTime / this.videoMain.duration * 100;
        });
        this.videoRange.addEventListener('input', () => {
            this.videoMain.currentTime = this.videoRange.value / 100 * this.videoMain.duration;
        });

        this.volumeValue.addEventListener('click', () => {
            if (this.videoMain.volume == 0) {
                this.videoMain.volume = 0;
                this.volumeRange.value = "0";
                this.volumeValue.className = 'fa-solid fa-volume-low';
            } else {
                this.volumeRange.value = "0"
                this.videoMain.volume = 0
                this.volumeValue.className = 'fa-solid fa-volume-xmark';
            }
        });
        this.volumeRange.addEventListener('input', () => {
            const vol = this.volumeRange.value
            this.videoMain.volume = vol
            if (vol == 0) {
                this.volumeValue.className = 'fa-solid fa-volume-xmark';
            } else {
                this.volumeValue.className = 'fa-solid fa-volume-low';
            }
        });
        this.nextVideo.addEventListener('click', () => this.handleVideoSwitch());
    }

    //Переключает состояние воспроизведения видео
    togglePlayPause() {
        if (this.videoMain.paused) {
            this.videoMain.play();
            this.play.className = 'fa-solid fa-pause';
        } else {
            this.videoMain.pause();
            this.play.className = 'fa-solid fa-play';
        }
    }

    //Устанавливает источник видео для главного видеоэлемента
    setVideoSource(src) {
        this.videoMain.src = src;
        this.videoMain.addEventListener('canplay', () => {
            this.videoMain.play();
        });
    }
    //Обрабатывает переключение видео
    handleVideoSwitch() {
        this.currentVideoIndex++;
        if (this.currentVideoIndex >= this.videos.length) {
            this.currentVideoIndex = 0;
        }
        if (this.videos[this.currentVideoIndex]) {
            this.setVideoSource(this.videos[this.currentVideoIndex].src);
            this.play.className = 'fa-solid fa-pause';
        } else {
            console.error('Video not found');
        }
    }


    //Проверяет, достиг ли пользователь конца страницы, и если да, загружает больше видео.
    async checkPosition() {
        const height = document.body.offsetHeight
        const screenHeight = window.innerHeight
        const scrolled = window.scrollY
        const threshold = height - screenHeight / 4
        const position = scrolled + screenHeight

        if (position >= threshold) {
            await this.loadMoreVideos()
        }
    }

    //Загружает больше видео с "сервера"
    async loadMoreVideos() {
        try {
            let nextPage = 1;
            while (nextPage) {
                const { videos, nextPage: newNextPage } = await server.getVideos(nextPage);
                videos.forEach(videoData => this.appendVideoToList(videoData));
                nextPage = newNextPage;
            }
        } catch (error) {
            console.error("An error occurred while loading more videos: ", error);
        }
    }

    //Добавляет видео в список видео на странице
    appendVideoToList(videoData) {
        const videoList = document.querySelector('.video-player__list')
        if (!videoList || !videoData) return;

        const videoNode = this.createVideoNode(videoData)
        videoList.append(videoNode)
        this.attachVideoClickHandler();
    }

    //Создает новый элемент видео
    createVideoNode(videoData) {
        const template = document.getElementById('video_template');
        const videoEl = template.content.cloneNode(true);
        const { src, title } = videoData;

        if (videoEl.querySelector('.video-player__el-title')) {
            videoEl.querySelector('.video-player__el-title').innerText = title.length > 35 ? title.slice(0, 35) + '...' : title;
        }
        if (videoEl.querySelector('.video-player__el')) {
            videoEl.querySelector('.video-player__el').src = src;
        }

        return videoEl;
    }

    //Добавляет обработчики кликов к видеоэлементам
    attachVideoClickHandler() {
        const videoEls = document.querySelectorAll('.video-player__el');
        videoEls.forEach(videoEl => {
            videoEl.addEventListener('click', (e) => this.handleVideoClick(e));
        });
    }

    //Обрабатывает клик по видеоэлементу
    handleVideoClick(e) {
        let videoSrc = '.' + e.target.src.slice(-12);
        this.setVideoSource(videoSrc);
        this.play.className = 'fa-solid fa-pause';
        const videoData = this.videos.find(v => v.src === videoSrc);
        if (videoData) {
            this.videoTitle.textContent = videoData.title;
            this.videoDesc.textContent = videoData.desc;
        }
    }
};

class CommentHandler {
    constructor() {
        // Инициализация элементов DOM
        this.commentForm = document.getElementById('commentForm');
        this.likeBtn = document.querySelector('.like-btn')

        // Инициализация обработчиков событий
        this.initEventHandlers();
    }

    //Инициализирует обработчики событий для формы комментариев и кнопки "Нравится".
    initEventHandlers() {
        // Обработчики событий
        this.commentForm.addEventListener('submit', (e) => this.handleCommentSubmit(e));
        this.likeBtn.addEventListener('click', () => this.handleLikeClick());
    }

    //Обрабатывает отправку формы комментариев
    handleCommentSubmit(e) {
        e.preventDefault();
        const comment = document.querySelector('.comment-input').value;
        const commentList = document.querySelector('.comment-list');
        const newComment = document.createElement('div');
        newComment.classList.add('comment');
        newComment.innerHTML = '<p>' + comment + '</p>';
        commentList.appendChild(newComment);
        document.querySelector('.comment-input').value = '';
    }

    //Обрабатывает клик по кнопке "Нравится"
    handleLikeClick() {
        this.likeBtn.classList.toggle('liked');
    }
};

// Инициализация классов
const videoPlayer = new VideoPlayer(videos);
const commentHandler = new CommentHandler();

; (() => {
    window.addEventListener('scroll', throttle(() => videoPlayer.checkPosition(), 250))
    window.addEventListener('resize', throttle(() => videoPlayer.checkPosition(), 250))
})();

videoPlayer.loadMoreVideos();


























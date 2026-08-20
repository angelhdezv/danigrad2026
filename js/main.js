'use strict';

/**
 * Daniela Leon · Class of 2026
 * Powered by Cáele.mx
 *
 * JavaScript is used only for progressive enhancement:
 * - RSVP link generation
 * - music playback controls
 * - autoplay attempt
 * - gift carousel navigation
 * - current year
 */


/* ==========================================================
   CONFIG
========================================================== */

const config = {
    /**
     * Mexican WhatsApp number.
     *
     * Format:
     * country code + 10 digit Mexican number.
     *
     * Example:
     * 527721234567
     */
    rsvpWhatsAppNumber: '527721335445',

    rsvpMessage: [
        'Hola Daniela 🎓',
        '',
        'Confirmo mi asistencia a tu graduación',
        'el 31 de octubre de 2026. 🎉',
    ].join('\n'),
};


/* ==========================================================
   DOM SELECTORS
========================================================== */

const elements = {
    audio: document.querySelector('#background-music'),

    musicToggle:
        document.querySelector('#music-toggle'),

    musicIcon:
        document.querySelector(
            '#music-toggle .music-player__icon',
        ),

    giftTrack:
        document.querySelector('[data-gift-track]'),

    giftPrevious:
        document.querySelector(
            '[data-carousel-previous]',
        ),

    giftNext:
        document.querySelector(
            '[data-carousel-next]',
        ),

    rsvpLink:
        document.querySelector('#rsvp-link'),

    currentYear:
        document.querySelector('[data-current-year]'),
};


/* ==========================================================
   RSVP
========================================================== */

const configureRSVP = () => {
    if (!elements.rsvpLink) {
        return;
    }

    const hasPlaceholder =
        config.rsvpWhatsAppNumber.includes('X');

    if (hasPlaceholder) {
        elements.rsvpLink.removeAttribute('target');

        elements.rsvpLink.addEventListener(
            'click',
            (event) => {
                event.preventDefault();

                console.warn(
                    'Complete the RSVP WhatsApp number in js/main.js.',
                );
            },
        );

        return;
    }

    const encodedMessage =
        encodeURIComponent(
            config.rsvpMessage,
        );

    elements.rsvpLink.href =
        `https://wa.me/${config.rsvpWhatsAppNumber}?text=${encodedMessage}`;
};


/* ==========================================================
   MUSIC
========================================================== */

const updateMusicUI = () => {
    if (
        !elements.audio ||
        !elements.musicToggle ||
        !elements.musicIcon
    ) {
        return;
    }

    const isPlaying =
        !elements.audio.paused;

    elements.musicToggle.setAttribute(
        'aria-pressed',
        String(isPlaying),
    );

    elements.musicToggle.setAttribute(
        'aria-label',
        isPlaying
            ? 'Pausar música'
            : 'Reproducir música',
    );

    elements.musicIcon.textContent =
        isPlaying
            ? 'Ⅱ'
            : '▶';
};


const playMusic = async () => {
    if (!elements.audio) {
        return false;
    }

    try {
        await elements.audio.play();

        updateMusicUI();

        return true;
    } catch {
        updateMusicUI();

        return false;
    }
};


const pauseMusic = () => {
    if (!elements.audio) {
        return;
    }

    elements.audio.pause();

    updateMusicUI();
};


const toggleMusic = async () => {
    if (!elements.audio) {
        return;
    }

    if (elements.audio.paused) {
        await playMusic();

        return;
    }

    pauseMusic();
};


/**
 * Browsers may reject autoplay with sound.
 *
 * We attempt autoplay immediately and, if rejected,
 * retry once after the user's first interaction.
 */
const configureMusic = async () => {
    if (
        !elements.audio ||
        !elements.musicToggle
    ) {
        return;
    }

    elements.audio.volume = 0.65;

    elements.musicToggle.addEventListener(
        'click',
        toggleMusic,
    );

    elements.audio.addEventListener(
        'play',
        updateMusicUI,
    );

    elements.audio.addEventListener(
        'pause',
        updateMusicUI,
    );

    const autoplaySucceeded =
        await playMusic();

    if (autoplaySucceeded) {
        return;
    }

    const retryPlayback = async () => {
        await playMusic();
    };

    document.addEventListener(
        'pointerdown',
        retryPlayback,
        {
            once: true,
            passive: true,
        },
    );

    document.addEventListener(
        'keydown',
        retryPlayback,
        {
            once: true,
        },
    );
};


/* ==========================================================
   GIFT CAROUSEL
========================================================== */

const getCarouselStep = () => {
    if (!elements.giftTrack) {
        return 0;
    }

    const firstCard =
        elements.giftTrack.querySelector(
            '.gift-card',
        );

    if (!firstCard) {
        return 0;
    }

    const computedStyle =
        window.getComputedStyle(
            elements.giftTrack,
        );

    const gap =
        Number.parseFloat(
            computedStyle.columnGap,
        ) || 0;

    return (
        firstCard.getBoundingClientRect().width +
        gap
    );
};


const scrollGiftCarousel = (direction) => {
    if (!elements.giftTrack) {
        return;
    }

    const step =
        getCarouselStep();

    elements.giftTrack.scrollBy({
        left:
            direction === 'next'
                ? step
                : -step,

        behavior: 'smooth',
    });
};


const configureGiftCarousel = () => {
    elements.giftPrevious?.addEventListener(
        'click',
        () => {
            scrollGiftCarousel('previous');
        },
    );

    elements.giftNext?.addEventListener(
        'click',
        () => {
            scrollGiftCarousel('next');
        },
    );
};


/* ==========================================================
   YEAR
========================================================== */

const updateCurrentYear = () => {
    if (!elements.currentYear) {
        return;
    }

    elements.currentYear.textContent =
        String(
            new Date().getFullYear(),
        );
};


/* ==========================================================
   APP
========================================================== */

const init = () => {
    configureRSVP();

    configureGiftCarousel();

    updateCurrentYear();

    configureMusic();
};

init();
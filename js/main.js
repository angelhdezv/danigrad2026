'use strict';

/**
 * Daniela Leon · Class of 2026
 * Powered by Cáele.mx
 *
 * JavaScript is used only for progressive enhancement:
 * - RSVP link generation
 * - music playback controls
 * - autoplay attempt
 * - event countdown
 * - gift carousel navigation
 * - current year
 */


/* ==========================================================
   CONFIG
========================================================== */

const config = {
    /**
     * 30 October 2026, 10:30 a.m. in Niagara Falls.
     * Niagara Falls is on Eastern Daylight Time (UTC-4) on the event date.
     */
    eventDateUtc: '2026-10-30T14:30:00Z',

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
        'Hola Daniela,',
        '',
        'Confirmo mi asistencia a tu graduación',
        'el 30 de octubre de 2026 a las 10:30 a. m.,',
        'hora de Niagara Falls.',
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

    countdown:
        document.querySelector('[data-countdown]'),

    countdownDays:
        document.querySelector('[data-countdown-days]'),

    countdownHours:
        document.querySelector('[data-countdown-hours]'),

    countdownMinutes:
        document.querySelector('[data-countdown-minutes]'),

    countdownSeconds:
        document.querySelector('[data-countdown-seconds]'),

    countdownStatus:
        document.querySelector('[data-countdown-status]'),

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
   LOCAL EVENT DATE AND TIME
========================================================== */

const capitalize = (value) =>
    value.charAt(0).toUpperCase() + value.slice(1);

const getFormattedPart = (date, options, type) => {
    const formatter = new Intl.DateTimeFormat('es-MX', options);
    const part = formatter
        .formatToParts(date)
        .find((item) => item.type === type);

    return part ? part.value : '';
};

const updateEventDateTime = () => {
    const eventDate = new Date(config.eventDateUtc);

    if (Number.isNaN(eventDate.getTime())) {
        return;
    }

    const localDate = new Intl.DateTimeFormat('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(eventDate);

    const localTime = new Intl.DateTimeFormat('es-MX', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(eventDate);

    const localDay = getFormattedPart(
        eventDate,
        { day: 'numeric' },
        'day',
    );

    const localMonth = capitalize(getFormattedPart(
        eventDate,
        { month: 'long' },
        'month',
    ));

    const localMonthShort = capitalize(getFormattedPart(
        eventDate,
        { month: 'short' },
        'month',
    ).replace('.', ''));

    const localYear = getFormattedPart(
        eventDate,
        { year: 'numeric' },
        'year',
    );

    const values = {
        '[data-event-local-date]': localDate,
        '[data-event-local-time]': localTime,
        '[data-event-local-day]': localDay,
        '[data-event-local-month]': localMonth,
        '[data-event-local-month-short]': localMonthShort,
        '[data-event-local-year]': localYear,
    };

    Object.entries(values).forEach(([selector, value]) => {
        document.querySelectorAll(selector).forEach((element) => {
            element.textContent = value;
        });
    });

    document.querySelectorAll('[data-event-zone-note]').forEach((element) => {
        const noteMode = element.dataset.eventZoneNote;

        element.textContent = noteMode === 'short'
            ? 'Tu hora local'
            : noteMode === 'compact'
                ? 'Tu hora local · Niagara: 10:30 a. m.'
                : 'Hora en tu dispositivo · Niagara Falls: 10:30 a. m.';
    });
};


/* ==========================================================
   COUNTDOWN
========================================================== */

const updateCountdown = () => {
    if (
        !elements.countdown ||
        !elements.countdownDays ||
        !elements.countdownHours ||
        !elements.countdownMinutes ||
        !elements.countdownSeconds
    ) {
        return 0;
    }

    const eventTime =
        new Date(config.eventDateUtc).getTime();

    const remainingMilliseconds =
        Math.max(eventTime - Date.now(), 0);

    const totalSeconds =
        Math.floor(remainingMilliseconds / 1000);

    const days =
        Math.floor(totalSeconds / 86400);

    const hours =
        Math.floor((totalSeconds % 86400) / 3600);

    const minutes =
        Math.floor((totalSeconds % 3600) / 60);

    const seconds =
        totalSeconds % 60;

    elements.countdownDays.textContent =
        String(days).padStart(3, '0');

    elements.countdownHours.textContent =
        String(hours).padStart(2, '0');

    elements.countdownMinutes.textContent =
        String(minutes).padStart(2, '0');

    elements.countdownSeconds.textContent =
        String(seconds).padStart(2, '0');

    const isComplete =
        remainingMilliseconds === 0;

    elements.countdown.classList.toggle(
        'is-complete',
        isComplete,
    );

    if (elements.countdownStatus) {
        const statusKey =
            `${days}-${hours}-${minutes}-${isComplete}`;

        if (
            elements.countdownStatus.dataset.statusKey !==
            statusKey
        ) {
            elements.countdownStatus.dataset.statusKey =
                statusKey;

            elements.countdownStatus.textContent =
                isComplete
                    ? 'La celebración ya comenzó.'
                    : `Faltan ${days} días, ${hours} horas y ${minutes} minutos para la graduación.`;
        }
    }

    return remainingMilliseconds;
};


const configureCountdown = () => {
    if (!elements.countdown) {
        return;
    }

    const remainingMilliseconds =
        updateCountdown();

    if (remainingMilliseconds === 0) {
        return;
    }

    const timer = window.setInterval(
        () => {
            if (updateCountdown() === 0) {
                window.clearInterval(timer);
            }
        },
        1000,
    );

    document.addEventListener(
        'visibilitychange',
        () => {
            if (!document.hidden) {
                updateCountdown();
            }
        },
    );
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
   EDITORIAL REVEALS
========================================================== */

const configureReveals = () => {
    const revealItems =
        document.querySelectorAll('[data-reveal]');

    if (!revealItems.length) {
        return;
    }

    document.documentElement.classList.add(
        'reveal-ready',
    );

    if (!('IntersectionObserver' in window)) {
        revealItems.forEach((item) => {
            item.classList.add('is-visible');
        });

        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add(
                    'is-visible',
                );

                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.12,
            rootMargin: '0px 0px -8% 0px',
        },
    );

    revealItems.forEach((item) => {
        observer.observe(item);
    });
};


/* ==========================================================
   APP
========================================================== */

const init = () => {
    configureReveals();

    updateEventDateTime();

    configureCountdown();

    configureRSVP();

    configureGiftCarousel();

    updateCurrentYear();

    configureMusic();
};

init();

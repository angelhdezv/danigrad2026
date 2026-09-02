'use strict';

const config = {
    // 30 October 2026, 10:30 a.m. in Niagara Falls (UTC-4).
    eventDateUtc: '2026-10-30T14:30:00Z',
    rsvpWhatsAppNumber: '527721335445',
    rsvpMessage: [
        'Hola Daniela,',
        '',
        'Ana Emi confirma su asistencia a tu graduación',
        'el 30 de octubre de 2026 a las 10:30 a. m.,',
        'hora de Niagara Falls.',
    ].join('\n'),
};

const elements = {
    audio: document.querySelector('#background-music'),
    musicToggle: document.querySelector('#music-toggle'),
    musicIcon: document.querySelector('#music-toggle .music-player__icon'),
    rsvpLink: document.querySelector('#rsvp-link'),
    currentYear: document.querySelector('[data-current-year]'),
    countdown: document.querySelector('[data-countdown]'),
    countdownDays: document.querySelector('[data-countdown-days]'),
    countdownHours: document.querySelector('[data-countdown-hours]'),
    countdownMinutes: document.querySelector('[data-countdown-minutes]'),
    countdownSeconds: document.querySelector('[data-countdown-seconds]'),
    countdownStatus: document.querySelector('[data-countdown-status]'),
};

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
        '[data-event-local-month-short]': localMonth,
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

    const remaining = Math.max(
        new Date(config.eventDateUtc).getTime() - Date.now(),
        0,
    );

    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    elements.countdownDays.textContent = String(days).padStart(3, '0');
    elements.countdownHours.textContent = String(hours).padStart(2, '0');
    elements.countdownMinutes.textContent = String(minutes).padStart(2, '0');
    elements.countdownSeconds.textContent = String(seconds).padStart(2, '0');

    const isComplete = remaining === 0;
    elements.countdown.classList.toggle('is-complete', isComplete);

    if (elements.countdownStatus) {
        const statusKey = `${days}-${hours}-${minutes}-${isComplete}`;

        if (elements.countdownStatus.dataset.statusKey !== statusKey) {
            elements.countdownStatus.dataset.statusKey = statusKey;
            elements.countdownStatus.textContent = isComplete
                ? 'La celebración ya comenzó.'
                : `Faltan ${days} días, ${hours} horas y ${minutes} minutos.`;
        }
    }

    return remaining;
};

const configureCountdown = () => {
    if (!elements.countdown) {
        return;
    }

    if (updateCountdown() === 0) {
        return;
    }

    const timer = window.setInterval(() => {
        if (updateCountdown() === 0) {
            window.clearInterval(timer);
        }
    }, 1000);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateCountdown();
        }
    });
};

const configureRSVP = () => {
    if (!elements.rsvpLink) {
        return;
    }

    const message = encodeURIComponent(config.rsvpMessage);
    elements.rsvpLink.href = `https://wa.me/${config.rsvpWhatsAppNumber}?text=${message}`;
};

const updateMusicUI = () => {
    if (!elements.audio || !elements.musicToggle || !elements.musicIcon) {
        return;
    }

    const isPlaying = !elements.audio.paused;
    elements.musicToggle.setAttribute('aria-pressed', String(isPlaying));
    elements.musicToggle.setAttribute(
        'aria-label',
        isPlaying ? 'Pausar música' : 'Reproducir música',
    );
    elements.musicIcon.textContent = isPlaying ? 'Ⅱ' : '▶';
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

const configureMusic = async () => {
    if (!elements.audio || !elements.musicToggle) {
        return;
    }

    elements.audio.volume = 0.65;
    elements.musicToggle.addEventListener('click', async () => {
        if (elements.audio.paused) {
            await playMusic();
        } else {
            elements.audio.pause();
            updateMusicUI();
        }
    });

    elements.audio.addEventListener('play', updateMusicUI);
    elements.audio.addEventListener('pause', updateMusicUI);

    if (await playMusic()) {
        return;
    }

    document.addEventListener('pointerdown', playMusic, {
        once: true,
        passive: true,
    });
};

const configureReveals = () => {
    const items = document.querySelectorAll('[data-reveal]');

    if (!items.length) {
        return;
    }

    document.documentElement.classList.add('reveal-ready');

    if (!('IntersectionObserver' in window)) {
        items.forEach((item) => item.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
    });

    items.forEach((item) => observer.observe(item));
};

const init = () => {
    configureReveals();
    updateEventDateTime();
    configureCountdown();
    configureRSVP();
    configureMusic();

    if (elements.currentYear) {
        elements.currentYear.textContent = String(new Date().getFullYear());
    }
};

init();

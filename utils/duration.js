
// duration.js
function duration(ms, colon = true) {
    let s = Math.floor((ms / 1000) % 60);
    let m = Math.floor((ms / (1000 * 60)) % 60);
    let h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    let d = Math.floor((ms / (1000 * 60 * 60 * 24)) % 365.25);
    
    return colon
        ? `${h !== 0 ? `${h}:` : ""}${m}:${s < 10 ? `0${s}` : s}`
        : `${
            d !== 0
                ? `${d} day${d !== 1 ? "s" : ""}`
                : h !== 0
                ? `${h} hour${h !== 1 ? "s" : ""}`
                : m !== 0
                ? `${m} minute${m !== 1 ? "s" : ""}`
                : s !== 0
                ? `${s} second${s !== 1 ? "s" : ""}`
                : ""
        }`;
}

module.exports = duration;

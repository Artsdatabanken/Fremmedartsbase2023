function beskrivTidSiden(dato, labels) {
  const DAY = 24 * 60 * 60;
  if (dato === undefined) return "";
  const secs = (new Date() - Date.parse(dato)) / 1000;
  if (secs < 20) return `${labels.justNow}`;
  if (secs < 180) return `${Math.round(secs / 10) * 10} ${labels.secondsago}`;
  if (secs < 2 * 60 * 60)
    return `${Math.round(secs / 60)} ${labels.minutesago}`;
  if (secs < 2 * DAY) return `${Math.round(secs / 60 / 60)} ${labels.hoursago}`;
  if (secs < 14 * DAY) return `${Math.round(secs / DAY)} ${labels.daysago}`;
  if (secs < 60 * DAY)
    return `${Math.round(secs / DAY / 7)} ${labels.weeksago}`;
  if (secs < 350 * DAY)
    return `${Math.round(secs / DAY / 30)} ${labels.monthsago}`;
  if (secs < 2000 * 365 * DAY)
    return `${Math.round(secs / DAY / 365)} ${labels.yearsago}`;
  return "";
}

export { beskrivTidSiden };

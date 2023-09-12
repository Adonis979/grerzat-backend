function  addMonth(date, months) {
    let d = date.getDate();
    date.setMonth(date.getMonth() + +months);
    if (date.getDate() !== d) {
        date.setDate(0);
    }
    return date;
}

module.exports = addMonth;
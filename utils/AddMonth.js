function addMonth(date, months) {
    const newDate = new Date(date); // Create a new date object to avoid modifying the original date
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
}

module.exports = addMonth;
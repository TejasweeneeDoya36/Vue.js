new Vue({
    el:'#mainPage',
    currentTheme:'default', // can be changed to dark
    currentPage:'lessons',
    showProfileMenu:false,
    lessons:[], // array of lessons data to be fetched form backend
    subjectImages:{ // mapping subjects to image filenames
        'Math':'math.png',
        'Hindi':'hindi.png',
        'English':'english.png',
        'Music': 'music.png',
        'French':'french.png',
        'Chemistry':'chemistry.png',
        'Art':'art.png',
        'History':'history.png',
        'Geography':'geaography.png',
        'Physics':'physics.png'
    },
    cartItems:[], //items added to cart
    selectedQuantities:{}, // quantities selected before adding to cart
    showConfirmation:false, //order confirmation
});
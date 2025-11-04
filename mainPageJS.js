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
    showConfirmation:false, //order confirmation visibility
    sortBy:'subject', // current sort field
    sortOrder:'asc', // default sort order
    searchTimeout:null, //timeout ID for serach debounce

    //checkout form details
    checkoutForm:{
        name:'',
        phone:''
    },

    //form validation errors (should not be empty)
    formErrors:{
        name:'',
        phone:''
    },

    //computed methods
    computed:{

    },

    //methods
    method:{
        //manage theme
        changeTheme: function(theme){
            this.currentTheme=theme;
            document.documentElement.setAttribute('data-theme',theme);
        },

        //manage profile menu
        toggleProfileMenu:function(){
            this.showProfileMenu = !this.showProfileMenu;
        },

        viewProfile: function(){
            this.showNotification('Profile page coming soon!');
            this.showProfileMenu=false;
        },

        viewOrders: function(){
            this.showNotification('Order history coming soon!');
            this.showProfileMenu=false;
        },

        logout: function(){
            this.showNotification('Logout successfully!');
            this.showProfileMenu=false;

            //rediredt to login page
            setTimeout(()=>{
                window.location.href='loginHTML.html';
            },1000);
        },
    },

});
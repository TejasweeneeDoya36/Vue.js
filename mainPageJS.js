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
        //search lessons
        displayedLessons:function(){
            var filtered = this.lessons;

            //filter lessons based on search query
            if (this.searchQuery.trim()){
                var query= this.searchQuery.toLowerCase();
                filtered-filtered.filter(function(lesson){
                    return lesson.subject.toLowerCase().includes(query)||
                    lesson.location.toLowerCase().includes(query)||
                    lesson.price.toString().includes(query)||
                    lesson.spaces.toString().includes(query)
                });
            }
            //sort lessons according to a selected field and order
            return filtered.sort(function(a,b){
                var aValue = a[this.sortBy];
                var bValue = b[this.sortBy];

                //convert strings to lowercase for consistent sorting
                if(typeof aValue === 'string'){
                    aValue=aValue.toLowerCase();
                    bValue=bValue.toLowerCase();
                }

                //order direction
                if (this.sortOrder === 'asc'){
                    return aValue > bValue ? 1:-1;
                }else{
                     return aValue < bValue ? 1:-1;
                }
            }.bind(this));
        },
        
        //total price of items in cart
        totalPrice:function(){
            return this.cartItems.reduce(function(total,item){
                return total + (item.price * item.quantity);
            },0);
        },

        //total number of item
        totalCartItems: function(){
            return this.cartItems.reduce(function(total,item){
                return total + item.quantity;
            },0);
        },

        //validate checkout form
        isFormValid:function(){
            var nameValid = /^[A-Za-z\s]+$/.test(this.checkoutForm.name.trim());
            var phoneValid = /^\d+$/.test(this.checkoutForm.phone.trim());

            return nameValid && phoneValid && this.checkoutForm.name.trim() && this.checkoutForm.phone.trim();
        },

        isCartButtonDisabled: function(){
            return this.cartItems.length ===0;
        }
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

    //navigation
    showLessonsPage: function(){
        this.currentPage='lessons';
    },

    showCartPage:function(){
        if(this.cartItems.length === 0){
            this.showNotification('Your cart is empty. Add a lesson first');
            return;
        }
        this.currentPage='cart';
    },

    //lesson image
    getSubjectImage:function(subject){
        const imageName = this.subjectImages[subject];
        return imageName? 'lessonImages' + imageName : 'lessonImages/default.jpeg';
    },

    //quantity
    getSelectedQuantity: function(lessonId){
        return this.selectedQuantities[lessonId] || 0;
    },

    //spaces
    getLessonsSpaces:function(lessonId){
        var lesson= this.lesson.find(function(l){
            return l.id === lessonId;
        });

        return lesson ? lesson.spaces : 0;
    },

    //increase quantity
    increaseQuantity: function(){
        var currentQty= this.getSelectedQuantity(lesson.id);
        if (currentQty< lesson.spaces){
            this.$set(this.selectedQuantities,lesson.id,currentQty + 1);
        }
    },

    //decrease quantity
    decreaseQuantity: function(){
        var currentQty= this.getSelectedQuantity(lesson.id);
        if (currentQty > 0){
            this.$set(this.selectedQuantities,lesson.id,currentQty - 1);
        }
    },

    //add items to cart
    addToCart: function(lesson){
        var selectedQty= this.getSelectedQuantity(lesson.id);

        if (selectedQty > 0 && lesson.spaces >= selectedQty){
            var existingItemIndex = this.cartItems.findIndex(function(item){
                return item.id === lesson.id
            });

            if(existingItemIndex > -1){
                this.cartItems[existingItemIndex].quantity += selectedQty;
            }else{
                this.cartItems.push({
                    id:lesson.id,
                    subject:lesson.subject,
                    location:lesson.location,
                    price: lesson.price,
                    quantity:selectedQty
                });
            }

            this.updateLessonSpaces(lesson.id,-selectedQty);
            this.$set(this.selectedQuantities,lesson.id,0);
        }

        this.showNotification('Added ' + selectedQty + ' ' + lesson.subject + ' to cart');
    },

    //increase quantity in cart
    increaseCartQuantity: function(lessonId){
        var cartItem = this.cartItems.find(function(item){
            return item.id === lessonId;
        });

        var lesson = this.lessons.find(function(l){
            return l.id === lesson.id;
        });

        if(cartItem && lesson && cartItem.quantity < lesson.spaces){
            cartItem.quantity++;
            this.updateLessonSpaces(lessonId,-1);
            this.showNotification('Increased quantity for' + cartItem.subject);
        }
    },

    //decrease quantity in cart
    decreaseCartQuantity: function(lessonId){
        var cartItem = this.cartItems.find(function(item){
            return item.id === lessonId;
        });

        var lesson = this.lessons.find(function(l){
            return l.id === lesson.id;
        });

        if(cartItem && cartItem.quantity > 1){
            cartItem.quantity--;
            this.updateLessonSpaces(lessonId,1);
            this.showNotification('Decreased quantity for' + cartItem.subject);
        }else if (cartItem && cartItem.quantity === 1){
            this.removeFromCart(lessonId);
        }
    },

    //remove item from cart
    removeFromCart: function(lessonId){
        var itemIndex = this.cartItems.findIndex(function(item){
            return item.id === lessonId;
        });

        if(itemIndex>-1){
            var removedItem= this.cartItem[itemIndex];
            this.cartItems.splice(itemIndex,1);
            this.updateLessonSpaces(lessonId,removedItem.quantity);
            this.showNotification(removedItem.subject + ' removed from cart');
        }
    },

    //fetch lessons

    //update lesson spaces
    updateLessonSpaces: function(lessonId,change){
        
    }
});
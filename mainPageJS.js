new Vue({
    el:'#mainPage',
    data:{
        currentTheme:'default', // can be changed to dark
        currentPage:'lessons', // active page: lessons 
        showProfileMenu:false, // controls profile dropdown visibility
        lessons:[], // array of lessons data to be fetched form backend
        subjectImages:{ // mapping subjects to image filenames
            'Math':'math.png',
            'Hindi':'hindi.jpeg',
            'English':'english.png',
            'Music': 'music.png',
            'French':'french.png',
            'Chemistry':'chemistry.png',
            'Art':'art.png',
            'History':'history.png',
            'Geography':'geography.png',
            'Physics':'physics.png'
        },
        searchQuery:'', // user search input
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
    },

    //computed methods - automatically update based on dependent data changes
    computed:{
        //search lessons (combined with sorting)
        displayedLessons:function(){
            var filtered = this.lessons;

            //filter lessons based on search query
            if (this.searchQuery.trim()){
                var query= this.searchQuery.toLowerCase();
                //search in subject, location, price and spaces
                filtered=filtered.filter(function(lesson){
                    return lesson.subject.toLowerCase().includes(query)||
                    lesson.location.toLowerCase().includes(query)||
                    lesson.price.toString().includes(query)||
                    lesson.spaces.toString().includes(query)
                });
            }
            var self=this; // store vue instance reference
            //sort lessons according to a selected field and order
            return filtered.sort(function(a,b){
                //get values to compare
                var aValue = a[self.sortBy];
                var bValue = b[self.sortBy];

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
            }.bind(this)); // bind 'this' to access Vue instance
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
                return total + item.quantity; //sum quantities
            },0);
        },

        //validate checkout form
        isFormValid:function(){
            // only letters and spaces for name
            var nameValid = /^[A-Za-z\s]+$/.test(this.checkoutForm.name.trim());
            // only numbers for phone
            var phoneValid = /^\d+$/.test(this.checkoutForm.phone.trim());

            return nameValid && phoneValid && this.checkoutForm.name.trim() && this.checkoutForm.phone.trim();
        },
        //check if cart button should be disabled
        isCartButtonDisabled: function(){
            return this.cartItems.length ===0; // disable if cart is empty
        }
    },

    //methods
    methods:{
        //manage theme
        changeTheme: function(theme){
            this.currentTheme=theme;
            document.documentElement.setAttribute('data-theme',theme);
        },

        //manage profile menu
        toggleProfileMenu:function(){
            this.showProfileMenu = !this.showProfileMenu;
        },
        //profile view handler
        viewProfile: function(){
            this.showNotification('Profile page coming soon!');
            this.showProfileMenu=false;
        },
        //order history handler
        viewOrders: function(){
            this.showNotification('Order history coming soon!');
            this.showProfileMenu=false;
        },
        //logout handler
        logout: function(){
            this.showNotification('Logout successfully!');
            this.showProfileMenu=false;//close menu

            //rediredt to login page
            setTimeout(()=>{
                window.location.href='loginHTML.html';
            },1000);
        },

        //navigation
        showLessonsPage: function(){
            this.currentPage='lessons'; //switch to lessons view
        },

        showCartPage:function(){
            if(this.cartItems.length === 0){
                this.showNotification('Your cart is empty. Add a lesson first');
                return; //prevent navigation to cart
            }
            this.currentPage='cart'; //switch to cart view
        },

        //lesson image
        getSubjectImage:function(subject){
            const imageName = this.subjectImages[subject];
            //return image path or default image
            return imageName? 'lessonImages/' + imageName : 'lessonImages/default.jpeg';
        },

        //quantity
        getSelectedQuantity: function(lessonId){
            //return selected quantity or 0 if not set
            return this.selectedQuantities[lessonId] || 0;
        },

        //spaces
        getLessonSpaces:function(lessonId){
            var lesson= this.lessons.find(function(l){
                return l.id === lessonId;
            });
            //return available spaces or 0 if lesson not found
            return lesson ? lesson.spaces : 0;
        },
        //set sort order
        setSortOrder:function(order){
            this.sortOrder=order;
        },
        //increase quantity
        increaseQuantity: function(lesson){
            //get current selected quantity
            var currentQty= this.getSelectedQuantity(lesson.id);
            if (currentQty< lesson.spaces){
                //update selected quantity reactively
                this.$set(this.selectedQuantities,lesson.id,currentQty + 1);
            }
        },

        //decrease quantity
        decreaseQuantity: function(lesson){
            //get current selected quantity
            var currentQty= this.getSelectedQuantity(lesson.id);
            if (currentQty > 0){
                //update selected quantity reactively
                this.$set(this.selectedQuantities,lesson.id,currentQty - 1);
            }
        },

        //add items to cart
        addToCart: function(lesson){
            //get selected quantity for the lesson
            var selectedQty= this.getSelectedQuantity(lesson.id);
            //only add if quantity is positive and within available spaces
            if (selectedQty > 0 && lesson.spaces >= selectedQty){
                var existingItemIndex = this.cartItems.findIndex(function(item){
                    return item.id === lesson.id
                });
                //if item already in cart, update quantity
                if(existingItemIndex > -1){
                    this.cartItems[existingItemIndex].quantity += selectedQty;
                }else{
                    //add new item to cart
                    this.cartItems.push({
                        id:lesson.id,
                        subject:lesson.subject,
                        location:lesson.location,
                        price: lesson.price,
                        quantity:selectedQty
                    });
                }
                //update available spaces
                this.updateLessonSpaces(lesson.id,-selectedQty);
                //reset selected quantity
                this.$set(this.selectedQuantities,lesson.id,0);
            }

            this.showNotification('Added ' + selectedQty + ' ' + lesson.subject + ' to cart');
        },

        //increase quantity in cart
        increaseCartQuantity: function(lessonId){
            //find item in cart
            var cartItem = this.cartItems.find(function(item){
                return item.id === lessonId;
            });
            //find corresponding lesson
            var lesson = this.lessons.find(function(l){
                return l.id === lessonId;
            });
            //only increase if spaces are available
            if(cartItem && lesson && cartItem.quantity < lesson.spaces){
                cartItem.quantity++;
                //update available spaces
                this.updateLessonSpaces(lessonId,-1);
                this.showNotification('Increased quantity for ' + cartItem.subject);
            }
        },

        //decrease quantity in cart
        decreaseCartQuantity: function(lessonId){
            var cartItem = this.cartItems.find(function(item){
                return item.id === lessonId;
            });
            //find corresponding lesson
            var lesson = this.lessons.find(function(l){
                return l.id === lessonId;
            });

            if(cartItem && cartItem.quantity > 1){
                cartItem.quantity--;
                this.updateLessonSpaces(lessonId,1);
                this.showNotification('Decreased quantity for ' + cartItem.subject);
            }else if (cartItem && cartItem.quantity === 1){
                this.removeFromCart(lessonId);
            }
        },

        //remove item from cart
        removeFromCart: function(lessonId){
            //find item index in cart
            var itemIndex = this.cartItems.findIndex(function(item){
                return item.id === lessonId;
            });
            //if found,remove it
            if(itemIndex>-1){
                var removedItem= this.cartItems[itemIndex];
                //remove from cart
                this.cartItems.splice(itemIndex,1);
                //restore available spaces
                this.updateLessonSpaces(lessonId,removedItem.quantity);
                this.showNotification(removedItem.subject + ' removed from cart');
            }
        },

        //fetch lessons
        fetchLessons: async function () {
            try{
                //fetch lessons from backend API
                const response= await fetch('http://localhost:3000/api/lessons');
                const data = await response.json();
                //check for success and valid lessons data
                if ( data.success && data.lessons){
                    //map backend data to frontend format
                    this.lessons = data.lessons.map(lesson => {
                        const lessonId = lesson.id ? lesson._id.toString() : (lesson.id || "Unknown");
                        const price = lesson.Price !== undefined ? lesson.Price : lesson.price;
                        //return formatted lesson object
                        return {
                            id: lessonId,
                            subject: lesson.subject,
                            location: lesson.location,
                            price: Number(price) || 0,
                            spaces: Number(lesson.spaces) || 0 
                        };
                    });
                    console.log('Fetched lessons:', this.lessons);
                }else{
                    console.error('Failed to fetch lessons',data.message);
                    this.showNotification('Error fetching lessons');
                    this.lessons= [];
                }
            } catch (error){//handle fetch errors
                console.error('Error connecting to backend',error);
                this.showNotification('Server connection failed');
                this.lessons= [];
            }
        },

        //update lesson spaces
        updateLessonSpaces: function(lessonId,change){
            //find lesson by ID
            var lesson = this.lessons.find(function(l){
                return l.id === lessonId;
            });

            if(lesson){
                lesson.spaces+=change;
                //ensures spaces does not go negative
                if(lesson.spaces < 0){
                    lesson.spaces=0;
                }
            }
        },

        //backend search
        handleSearch:function(){
            //clear previous timeout if exists
            if(this.searchTimeout){
                clearTimeout(this.searchTimeout);
            }

            //debounce user typing
            this.searchTimeout = setTimeout(async ()=>{
                try{
                    const query = this.searchQuery.trim();

                    //if query is empty,fetch all lessons
                    if(query ===''){
                        this.fetchLessons();
                        return;
                    }

                    //fetch from backend search API
                    const response = await fetch (`http://localhost:3000/api/search?q=${encodeURIComponent(query)}`);
                    const data = await response.json();

                    if(data.success){
                        //replace lessons list with search results
                        this.lessons = data.lessons.map(lesson=>({
                            id: lesson.id || lesson._id,
                            subject: lesson.subject,
                            location: lesson.location,
                            price: lesson.Price || lesson.price,
                            spaces: lesson.spaces 
                        }));
                        console.log('Search results', this.lessons);
                    }else{
                        this.showNotification('Search failed: ' + data.message);
                    }
                }catch(error){//handle errors
                    console.error('Error performing search:',error);
                    this.showNotification('Server error while searching');
                }
            },300);
        },

        //checkout
        handleCheckout: async function() {
            //validate form before submission
            if (!this.isFormValid){
                this.showNotification('Please fill out the form correctly','error');
                return;
            }

            try{
                //log order details
                console.log('Submitting order:',{
                    customer:this.checkoutForm,
                    items:this.cartItems,
                    total:this.totalPrice
                })
            
                //save order to database
                const orderData= {
                    name: this.checkoutForm.name.trim(),
                    phone:this.checkoutForm.phone.trim(),
                    //map cart items to order lessons
                    lessons: this.cartItems.map(item => ({
                        id:item.id,
                        subject:item.subject,
                        quantity:item.quantity,
                    })),
                    totalPrice: this.totalPrice,
                    dateOfOrder: new Date().toISOString()
                };
                //send order data to backend API
                const orderResponse = await fetch ('http://localhost:3000/api/orders',{
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(orderData)
                });
                //parse response
                const orderResult = await orderResponse.json();

                if(orderResult.success){
                    console.log('Order saved successfully',orderResult);
                    this.showConfirmation= true;
                }else{
                    this.showNotification('Failed to save order' + orderResult.message, 'error' );
                }

            }catch(error){//handle errors
                console.log('Error during checkout',error);
                this.showNotification('Error while processing checkout', 'error' );
            }

            //update spaces in database 
            const spaceUpdates = this.cartItems.map(item => ({
                id: item.id,
                change: -item.quantity //reduce available spaces
            }));

            try{
                //send space updates to backend API
                const updateResponse = await fetch ('http://localhost:3000/api/update-spaces',{
                    method: 'PUT',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({updates: spaceUpdates})
                });
                //parse response
                const updateResult = await updateResponse.json();

                if(updateResult.success){
                    console.log('Lesson spaces updated successfully');
                }else{
                    this.showNotification('Failed to update lesson spaces: ' + updateResult.message, 'error');
                }
            }catch(error){//handle errors
                console.error('Error updating lesson spaces:', error);
                this.showNotification('Error updating lesson spaces', 'error');
            }
        },

        //continue shopping
        continueShopping: function(){
            //reset cart,quantities,form and modal
            this.cartItems=[];
            this.selectedQuantities={};
            this.checkoutForm={name:'',phone:''};
            this.formErrors={name:'',phone:''};
            this.showConfirmation=false;
            this.currentPage='lessons';
            //refresh lessons from backend
            this.fetchLessons();
            this.showNotification('Order completed successfully');
        },
        // Validate checkout form and set error messages
        validateForm: function() {
            // Validate name: only letters and spaces allowed
            if (!/^[A-Za-z\s]+$/.test(this.checkoutForm.name.trim())) {
                this.formErrors.name = 'Name should contain letters only.'
            } else {
                this.formErrors.name = ''; // Clear error if valid
            }

            // Validate phone: only digits allowed
            if (!/^\d+$/.test(this.checkoutForm.phone.trim())) {
                this.formErrors.phone = 'Phone should contain numbers only.'
            } else {
                this.formErrors.phone = ''; // Clear error if valid
            }
        },
        //notification
        showNotification: function(message,type='success'){
            var notification = document.createElement('div');
            notification.className='notification';

            //add appropriate icon based on type
            var iconClass= type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle';
            notification.innerHTML=`<i class="bi ${iconClass}"></i> ${message}`;

            //style based on type
            if(type === 'error'){
                notification.style.background='var(--error-color)';
            }

            document.body.appendChild(notification);
            //remove notification after 3 seconds
            setTimeout(function(){
                if(notification.parentNode){
                    notification.parentNode.removeChild(notification);
                }
            },3000);
        }
    },

    mounted:function(){
        //initialise theme on page load
        this.changeTheme(this.currentTheme);

        //add css animation for notifications
        var style = document.createElement('style');
        style.textContent=`
            @keyframes slideIn{
                from{
                    transform:translateX(100%);
                    opacity:0;
                }
                to{
                    transform:translateX(0);
                    opacity:1;
                }    
            }
            .notification{
                position: fixed;
                top:20px;
                right:20px;
                background: var(--success-color);
                color:white;
                padding:15px 20px;
                border-radius:8px;
                z-index:1001;
                animation: slideIn 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                font-weight:500;
                display:flex;
                align-items: center;
                gap:8px
            }
            
            .notification.error{
                background: #dc3545 !important
            }
        `;
        document.head.appendChild(style);

        //fetch lessons from backend API
        this.fetchLessons();

        //close profile menu when clicking outside
        document.addEventListener('click',function(event){
            if(!event.target.closest('.profile-section')){
                this.showProfileMenu=false;
            }
        }.bind(this));
    }
});
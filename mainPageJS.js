new Vue({
    el:'#mainPage',
    data:{
        currentTheme:'default', // can be changed to dark
        currentPage:'lessons',
        showProfileMenu:false,
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
        searchQuery:'',
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

    //computed methods
    computed:{
        //search lessons
        displayedLessons:function(){
            var filtered = this.lessons;

            //filter lessons based on search query
            if (this.searchQuery.trim()){
                var query= this.searchQuery.toLowerCase();
                filtered=filtered.filter(function(lesson){
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
            return imageName? 'lessonImages/' + imageName : 'lessonImages/default.jpeg';
        },

        //quantity
        getSelectedQuantity: function(lessonId){
            return this.selectedQuantities[lessonId] || 0;
        },

        //spaces
        getLessonSpaces:function(lessonId){
            var lesson= this.lessons.find(function(l){
                return l.id === lessonId;
            });

            return lesson ? lesson.spaces : 0;
        },

        //increase quantity
        increaseQuantity: function(lesson){
            var currentQty= this.getSelectedQuantity(lesson.id);
            if (currentQty< lesson.spaces){
                this.$set(this.selectedQuantities,lesson.id,currentQty + 1);
            }
        },

        //decrease quantity
        decreaseQuantity: function(lesson){
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
                return l.id === lessonId;
            });

            if(cartItem && lesson && cartItem.quantity < lesson.spaces){
                cartItem.quantity++;
                this.updateLessonSpaces(lessonId,-1);
                this.showNotification('Increased quantity for ' + cartItem.subject);
            }
        },

        //decrease quantity in cart
        decreaseCartQuantity: function(lessonId){
            var cartItem = this.cartItems.find(function(item){
                return item.id === lessonId;
            });

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
            var itemIndex = this.cartItems.findIndex(function(item){
                return item.id === lessonId;
            });

            if(itemIndex>-1){
                var removedItem= this.cartItems[itemIndex];
                this.cartItems.splice(itemIndex,1);
                this.updateLessonSpaces(lessonId,removedItem.quantity);
                this.showNotification(removedItem.subject + ' removed from cart');
            }
        },

        //fetch lessons
        fetchLessons: async function () {
            try{
                const response= await fetch('http://localhost:3000/api/lessons');
                const data = await response.json();

                if ( data.success){
                    this.lessons = data.lessons.map(lesson => ({
                        id: lesson.id || lesson._id,
                        subject: lesson.subject,
                        location: lesson.location,
                        price: lesson.Price || lesson.price,
                        spaces: lesson.spaces || 5
                    }));

                    console.log('Fetched lessons:', this.lessons);
                }else{
                    console.error('Failed to fetch lessons',data.message);
                    this.showNotification('Error fetching lessons');
                    this.lessons= [];
                }
            } catch (error){
                console.error('Error connecting to backend',error);
                this.showNotification('Server connection failed');
                this.lessons= [];
            }
        },

        //update lesson spaces
        updateLessonSpaces: function(lessonId,change){
            var lesson = this.lessons.find(function(l){
                return l.id === lessonId;
            });

            if(lesson){
                lesson.spaces+=change;
            }
        },

        setSortOrder:function(order){
            this.sortOrder=order;
        },

        //backend search
        handleSearch:function(){
            if(this.searchTimeout){
                clearTimeout(this.searchTimeout);
            }

            //debounce user typing
            this.searchTimeout = setTimeout(async ()=>{
                try{
                    const query = this.searchQuery.trim();

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
                }catch(error){
                    console.error('Error performing search:',error);
                    this.showNotification('Server error while searching');
                }
            },300);
        },

        //checkout
        validateForm:function(){
            //check if name contains only letters
            if (!/^[A-Za-z\s]+$/.test(this.checkoutForm.name.trim())){
                this.formErrors.name = 'Name should contain letters only.'
            }else{
                this.formErrors.name ='';
            }

            //check if phone numbers contain numbers only
            if (!/^\d+$/.test(this.checkoutForm.phone.trim())){
                this.formErrors.phone = 'Phone should contain numbers only.'
            }else{
                this.formErrors.phone='';
            }
        },

        //checkout
        handleCheckout: async function() {
            if (!this.isFormValid){
                this.showNotification('Please fill out the form correctly','error');
                return;
            }

            try{
                console.log('Submitting order:',{
                    customer: this.checkoutForm,
                    items: this.cartItems,
                    total: this.totalPrice
                });
                //update lesson spaces in database
                for (const item of this.cartItems){
                    const lesson = this.lessons.find(l => l.id === item.id);
                    if(lesson){
                        // Compute new available spaces
                        const newSpaces = Math.max(lesson.spaces - item.quantity, 0);

                        const response = await fetch (`http://localhost:3000/api/lessons/${lesson.id}`,{
                            method: 'PUT',
                            headers: {'Content-Type':'application/json'},
                            body: JSON.stringify({spaces: newSpaces})
                        });

                        const data = await response.json();
                        if(!data.success){
                            console.error(`Failed to update lesson spaces for ${lesson.subject}: ${data.message}`);
                            this.showNotification(`Failed to update lesson spaces for ${lesson.subject}`, 'error');
                        }else{
                            console.log(`Updated lesson spaces for ${lesson.subject}`); 
                            lesson.spaces = newSpaces; //update local data
                        }
                    }    
                }
                //save order to database
                const orderData= {
                    name: this.checkoutForm.name.trim(),
                    phone:this.checkoutForm.phone.trim(),
                    lessonNamess:this.cartItems.map(item => item.subject),
                    spaces: this.cartItems.map(item => item.quantity),
                    totalPrice: this.totalPrice,
                    dateOfOrder: new Date().toISOString()
                };

                const orderResponse = await fetch ('http://localhost:3000/api/orders',{
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(orderData)
                });

                const orderResult = await orderResponse.json();

                if(orderResult.success){
                    console.log('Order saved successfully',orderResult);
                    this.showConfirmation= true;
                }else{
                    this.showNotification('Failed to save order' + orderResult.message, 'error' );
                }

            }catch(error){
                console.log('Error during checkout',error);
                this.showNotification('Error while processing checkout', 'error' );
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

            this.showNotification('Order completed successfully');
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
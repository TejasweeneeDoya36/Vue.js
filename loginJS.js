new Vue({
    el:'#app',
    data:{
        activeTab:'login',
        loginForm:{
            email:'',
            password:''
        },
        signupForm:{
            name:'',
            email:'',
            password:'',
            confirmPassword:''
        },
        errors:{
            loginEmail:'',
            loginPassword:'',
            signupName:'',
            signupEmail:'',
            signupPassword:'',
            signupConfirm:'',
        },
        message:{
            text:'',
            type:'' //success or error
        },
        isLoading: false,
        userCount:12548, //to be amended
        showUserCount: true,
        passwordStrength:{
            class:'weak',
            text:'Weak'
        },
        //array of form validation rules
        validationRules:{
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            password:/^(?=.*[A-Z])(?=.*[0-9])(?=.[!@#$%^&*])(a-zA-Z0-9!@#$%^&*){6,}$/
        },
    },
    computed:{
        //to check if login is valid
        isLoginFormValid: function(){
            return this.loginForm.email && this.loginForm.password && this.loginForm.password.length >=6 && this.isValidEmail(this.loginForm.email);
        },
        //to check if sign up is valid
        isSignupFormValid: function(){
            return this.signupForm.email && this.signupForm.password && this.signupForm.confirmPassword && this.loginForm.password.length >=6 && this.loginForm.password === this.signupForm.confirmPassword  && this.isValidEmail(this.loginForm.email);
        },

        //get form status message
        formStatus: function(){
            if (this.activeTab === 'login'){
                return this.isLoginFormValid ? 'Ready to sign in!' : 'Please complete all fields correctly';
            }else{
                return this.isSignupFormValid ? 'Ready to create your account!' : 'Please complete all fields correctly';
            }
        },

        //get form status class
        formStatusClass: function(){
            if (this.activeTab === 'login'){
                return this.isLoginFormValid ? 'info' : 'warning';
            }else{
                return this.isSignupFormValid ? 'info' : 'warning';
            }
        }
    },
    methods:{
        // switch between login and signup tabs
        switchTab: function(tab){
            this.activeTab=tab;
            this.clearErrors();
            this.clearMessage();
        },
        //clear all error messages
        clearErrors: function(){
            for (let error in this.errors){
                this.errors[error]='';
            }
        },
        //clear specific error field
        clearError: function(field){
            this.errors[field]='';
        },
        //clear message
        clearMessage: function(){
            this.message.text='';
            this.message.type='';
        },

        //validate email format
        isValidEmail: function(email){
            return this.validationRules.email.test(email);
        },

        //validate individual field
        validateField: function(field){
            switch(field){
                case 'loginEmail':
                    if(!this.loginForm.email){
                        this.errors.loginEmail='Email is required';
                    } else if (!this.isValidEmail(this.loginForm.email)){
                        this.errors.loginEmail='Please enter a valid email address';
                    }
                    break;
                case 'loginPassword':
                    if(!this.loginForm.password){
                        this.errors.loginPassword='Password is required';
                    } else if (this.loginForm.password.length < 6){
                        this.errors.loginEmail='Password must be atleast 6 characters';
                    }
                    break; 
                case 'signupName':
                    if(!this.signupForm.name){
                        this.errors.lsignupName='Full name is required';
                    } else if (this.loginForm.name.length < 2){
                        this.errors.signupName='Name must be atleast 2 characters';
                    }
                    break;    
                case 'signupEmail':
                    if(!this.signupForm.email){
                        this.errors.signupEmail='Email is required';
                    } else if (!this.isValidEmail(this.signupForm.email)){
                        this.errors.signupEmail='Please enter a valid email adress';
                    }
                    break;
                case 'signupPassword':
                    if(!this.signupForm.password){
                        this.errors.signupPassword='Password is required';
                    } else if (this.signupForm.password.length < 6){
                        this.errors.signupPassword='Password must be atleast 6 characters';
                    }
                    break;
                case 'signupConfirm':
                    if(!this.signupForm.password){
                        this.errors.confirmPassword='Password is required';
                    } else if (this.signupForm.password !== this.signupForm.confirmPassword ){
                        this.errors.signupConfirm='Password do not match';
                    }
                    break;    

            }
        },

        //check password strength
        checkPasswordStrength: function(){
            const password = this.signupForm.password;

            if(!password){
                this.passwordStrength.class='weak';
                this.passwordStrength.text='Weak';
                return;
            }

            let strength=0;
            if(password.length>=6) strength++;
            if(password.length>=8) strength++;
            if(/[A-Z]/.test(password)) strength++;
            if(/[0-9]/.test(password)) strength++;
            if(/[^A-Za-z0-9]/.test(password)) strength++;

            if (strength <= 2){
                this.passwordStrength.class='weak';
                this.passwordStrength.text='Weak';
            } else if (strength <= 4){
                this.passwordStrength.class='medium';
                this.passwordStrength.text='Medium';
            }else{
                this.passwordStrength.class='strong';
                this.passwordStrength.text='Strong';
            }
        },

        // validate login form
        validateLogin: function(){
            let isValid=true;

            if(!this.loginForm.email){
                this.errors.loginEmail='Email is required';
                isValid=false;
            } else if (!this.isValidEmail(this.loginForm.email)){
                this.errors.loginEmail='Please enter a valid email address';
                isValid=false;
            }

            if(!this.loginForm.password){
                this.errors.loginPassword='Password is required';
                isValid=false;
            } else if (this.loginForm.password.length < 6){
                this.errors.loginEmail='Password must be atleast 6 characters';
                isValid=false;
            }

            return isValid;
        },

        //validate signup form
        validateSignup: function(){
            let isValid=true;

            if(!this.signupForm.name){
                this.errors.signupName='Full name is required';
                isValid=false;
            } 

            if(!this.signupForm.email){
                this.errors.signupEmail='Email is required';
                isValid=false;
            } else if (!this.isValidEmail(this.signupForm.email)){
                this.errors.signupEmail='Please enter a valid email adress';
                isValid=false;
            }

            if(!this.signupForm.password){
                this.errors.signupPassword='Password is required';
                isValid=false;
            } else if (this.signupForm.password.length < 6){
                    this.errors.signupPassword='Password must be atleast 6 characters';
                    isValid=false;
            }

            if(!this.signupForm.confirmPassword){
                this.errors.confirmPassword='Please confirm your password';
                isValid=false;
            } else if (this.signupForm.password !== this.signupForm.confirmPassword ){
                this.errors.signupConfirm='Password do not match';
                isValid=false;
            
            }
            return isValid;
        },

        //handle login form submission
        login:function(){
            if (this.validateLogin()){
                this.isLoading= true;

                setTimeout(()=>{
                    this.isLoading= false;
                    this.showMessage("Login successful","success");

                    //reset form
                    this.loginForm.email='';
                    this.loginForm.password='';
                },1500);
            }else{
                this.showMessage("Please fix the errors above","error");
            }
        },

        //handle signup form submission
        signup:function(){
            if (this.validateSignup()){
                this.isLoading= true;

                setTimeout(()=>{
                    this.isLoading= false;
                    this.showMessage(`Signup successful!, Welcome ${this.signupForm.name}`,"success");

                    //update user count
                    this.userCount++;

                    //reset form
                    this.signupForm={
                        name:'',
                        email:'',
                        password:'',
                        confirmPassword:''
                    };

                    //switch to tab login
                    setTimeout(()=>{
                        this.switchTab('login');
                    },3000);
                },1500);
            }else{
                this.showMessage("Please fix the errors above","error");
            }
        },

        showMessage: function(text,type){
            this.message.text=text;
            this.message.type=type;

            //autohide success messages after 5 seconds
            if (type=== 'success'){
                setTimeout(()=>{
                    this.clearMessage();
                },5000);
            }
        },

        getSubtext:function(){
            return this.activeTab === 'login'
                ? 'Access your personalised dashboard and continue where you left off'
                : 'Create your account to explore our extensive library lessons';
        },

        showForgotPassword: function(){
            this.showMessage('Password reset feature coming soon','success');
        },

        showTerms: function(){
            this.showMessage('Terms of Service feature coming soon','success');
        },

        showPrivacy: function(){
            this.showMessage('Privacy policy feature coming soon','success');
        },

        //method to handle keypress events
        handleKeypress: function(event){
            //enter key to submit form
            if(event.key === 'Enter' && !event.shiftKey){
                if (this.activeTab === 'login' && this.isLoginFormValid){
                    this.login();
                }else if (this.activeTab === 'signup' && this.isSignupFormValid){
                    this.signup();
                }
            }

            //escape key to clear messages
            if(event.key === 'Escape'){
                this.clearMessage();
            }
        }
    },

    //lifecycle hook
    mounted: function(){
        console.log('Vue application mounted successfully');

        //global press listener
        document.addEventListener('keypress',this.handleKeypress);

        setTimeout(()=>{
            this.showUserCount=true;
        },1000);
    },

    beforeDestroy:function(){
        document.removeEventListener('keypress',this.handleKeypress);
    }
});
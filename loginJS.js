//manage login and signup
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
        errors:{},
        message:{
            text:'',
            type:'' //success or error
        },
        isLoading: false,
        userCount:0,
        showUserCount: true,
        passwordStrength:{
            class:'weak',
            text:'Weak'
        },
        apiBaseUrl:'http://localhost:3000/api',
        //array of form validation rules
        validationRules:{
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            password:/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/
        },
        passwordCheckTimeout:null
    },
    computed:{
        //to check if login is valid
        isLoginFormValid: function(){
            const {email,password} = this.loginForm;
            return password.length >=6 && this.isValidEmail(email);
        },
        //to check if sign up is valid
        isSignupFormValid: function(){
            const {name,email,password,confirmPassword} = this.signupForm;
            return password.length >=6 && password === confirmPassword  && this.isValidEmail(email) && name.trim().length >=2;
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
           this.errors={};
        },
        //clear message
        clearMessage: function(){
            this.message.text='';
            this.message.type='';
        },

        //validate email format
        isValidEmail: function(email){
            return this.validationRules.email.test(email.trim());
        },

        showMessage: function(text,type){
            this.message.text=text;
            this.message.type=type;

            //autohide success messages after 5 seconds
            if (type === 'success'){
                setTimeout(()=>{
                    this.clearMessage();
                },5000);
            }
        },
        
        //check password strength
        checkPasswordStrength: function(){
            clearTimeout(this.passwordCheckTimeout);
            const pw = this.signupForm.password;
           
            let strength=0;
            if(pw.length>=6) strength++;
            if(pw.length>=8) strength++;
            if(/[A-Z]/.test(pw)) strength++;
            if(/[0-9]/.test(pw)) strength++;
            if(/[^A-Za-z0-9]/.test(pw)) strength++;

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
            const {email,password} = this.loginForm;
            this.clearErrors();

            if(!email){
                this.errors.loginEmail='Email is required';
            } else if (!this.isValidEmail(email)){
                this.errors.loginEmail='Please enter a valid email address';
            }

            if(!password){
                this.errors.loginPassword='Password is required';
            } else if (password.length < 6){
                this.errors.loginPassword='Password must be atleast 6 characters';
            }

            return Object.keys(this.errors).length === 0;
        },

        //validate signup form
        validateSignup: function(){
            const {name,email,password,confirmPassword} = this.signupForm;
            this.clearErrors();

            //check if name is empty
            if(!name.trim()){
                this.errors.signupName='Full name is required';
            } 
            //check email
            if(!email.trim()){
                this.errors.signupEmail='Email is required';
            } else if (!this.isValidEmail(email)){
                this.errors.signupEmail='Please enter a valid email adress';
            }
            //check password
            if(!password){
                this.errors.signupPassword='Password is required';
            } else if (password.length < 6){
                    this.errors.signupPassword='Password must be atleast 6 characters';
            }

            if(!confirmPassword){
                this.errors.confirmPassword='Please confirm your password';
            } else if (password !== confirmPassword ){
                this.errors.signupConfirm='Password do not match';
            }
            return Object.keys(this.errors).length === 0;
        },

        //handle login form submission
        login: async function(){
            if (this.validateLogin()){
                this.isLoading= true;
                try{
                    const data = await fetch ("http://localhost:3000/login",{
                        method:"POST",
                        headers:{"Content-Type":"application/json"},
                        body: JSON.stringify({
                            email:this.loginForm.email,
                            password: this.loginForm.password
                        })
                    });

                    const result = await response.json();
                    this.isLoading=false;

                    //if login is successful
                    if (result.success){
                        this.showMessage(`Welcome back, ${result.user.name}`,"success");
                        this.loginForm.password="";
                        //redirect user to main page
                        setTimeout(()=>{
                            window.location.href="../Vue.js/mainPageHTML.html";
                        });
                    }else{
                        this.showMessage(data.message || "Login failed");
                    }
                }  catch(err){
                    this.isLoading=false;
                    console.error("Login error:",err);
                    this.showMessage("Network error. Please try again");
                }
            }
        },

        //handle signup form submission
        signup: async function(){
            if (this.validateSignup()){
                this.isLoading= true;
                try{
                    //send data to backend signup route
                    const response = await fetch ("http://localhost:3000/signup",{
                        method: "POST",
                        headers:{"Content-Type":"application/json"},
                        body: JSON.stringify({
                            name: this.signupForm.name,
                            email:this.signupForm.email,
                            password: this.signupForm.password,
                            confirmPassword: this.signupForm.confirmPassword
                        })
                    });

                    const result = await response.json();

                    if (response.ok){
                        //if sign up is successful
                        this.showMessage(`Signup successful! Welcome ${this.signupForm.name}`,"success");
                        this.fetchUserCount;
                        //reset form
                        this.signupForm={
                            name:"",
                            email:"",
                            password:"",
                            confirmPassword:""
                        };

                        //redirect user to main page
                        setTimeout(()=>{
                            window.location.href="../Vue.js/mainPageHTML.html";
                        },1500);
                    }else{
                        this.showMessage(result.message || "Signup failed. Try again", "error");
                    }
                }catch(error){
                    this.isLoading=false;
                    console.error("Signup error:",error);
                    this.showMessage("Network error.Please try again","error");
                }
            }else{
                this.showMessage("Fix the errors")
            }
        },

        //user count
        fetchUserCount: async function() {
            try{
                const data = await fetch('http://localhost:3000/user-count');
                if (data.success){
                    this.userCount = data.count;
                }
            } catch( err){
                console.warn('failed to fetch user count:',err.message);
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
        this.fetchUserCount();
        setTimeout(()=>{
            this.showUserCount=true;
        },800);
    },

    beforeDestroy:function(){
        document.removeEventListener('keypress',this.handleKeypress);
    }
});
loginform = document.getElementById('loginform')
submit = document.getElementById("submit")
submit.addEventListener("click",async (e)=>{
    e.preventDefault()
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value
    
    try {
        const response = await fetch('/login',{
            method :'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({"username":username,"password":password})
        })
        
        if(response.ok) {
            // If login is successful, the page will redirect automatically
            const html = await response.text()
            document.body.innerHTML = html
        } else {
            const data = await response.json()
            alert(data.message || "Login failed")
        }
    } catch(err) {
        console.error("Error:", err)
        alert("An error occurred. Please try again.")
    }
})



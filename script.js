const form = document.querySelector('.contact form');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.querySelector('#name');
    const email = document.querySelector('#email');
    const message = document.querySelector('#message');

    if (name.value && email.value && message.value) {
        alert('Form submitted successfully!');
        form.reset();
    } else {
        alert('Please fill out all fields.');
    }
});
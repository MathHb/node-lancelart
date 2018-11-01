const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.json({
		message: 'Oops!'
	})
})

function validateUser(user){
	const validEmail = typeof user.email == 'string' && user.email.trim() != '';
	const validPass = typeof user.senha == 'string' && user.senha.trim() != '' && user.password.trim.length >= 6;

	return validPass && validEmail;
}

router.post('/signup', (req,res, next) => {
	if (validateUser(req.body)) {

	}else{
		next(new Error('Usuário inválido'));
	}
});

module.exports = router;
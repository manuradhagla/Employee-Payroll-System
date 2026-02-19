const express = require('express');
const path = require('path');
const fileHandler = require('./modules/fileHandler');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Dashboard
app.get('/', async (req, res) => {
    const employees = await fileHandler.read();
    res.render('index', { employees });
});

// Add Employee Form
app.get('/add', (req, res) => {
    res.render('add');
});

// Add Employee Logic
app.post('/add', async (req, res) => {
    const { name, profile, gender, department, salary, day, month, year, notes } = req.body;
    if (!name || !salary || salary <= 0) return res.redirect('/add');

    const employees = await fileHandler.read();
    const newEmployee = {
        id: Date.now(),
        name,
        profile,
        gender,
        department: Array.isArray(department) ? department : (department ? [department] : []),
        salary: Number(salary),
        startDate: `${day}-${month}-${year}`,
        notes
    };
    employees.push(newEmployee);
    await fileHandler.write(employees);
    res.redirect('/');
});

// Delete Employee
app.get('/delete/:id', async (req, res) => {
    const employees = await fileHandler.read();
    const updated = employees.filter(emp => emp.id != req.params.id);
    await fileHandler.write(updated);
    res.redirect('/');
});

// Edit Employee Form
app.get('/edit/:id', async (req, res) => {
    const employees = await fileHandler.read();
    const employee = employees.find(emp => emp.id == req.params.id);
    res.render('edit', { employee });
});

// Edit Employee Logic
app.post('/edit/:id', async (req, res) => {
    const { name, profile, gender, department, salary, day, month, year, notes } = req.body;
    const employees = await fileHandler.read();
    const index = employees.findIndex(emp => emp.id == req.params.id);

    if (index !== -1 && name && salary > 0) {
        employees[index] = {
            id: employees[index].id,
            name,
            profile,
            gender,
            department: Array.isArray(department) ? department : (department ? [department] : []),
            salary: Number(salary),
            startDate: `${day}-${month}-${year}`,
            notes
        };
        await fileHandler.write(employees);
    }
    res.redirect('/');
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

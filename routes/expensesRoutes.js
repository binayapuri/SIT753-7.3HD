// const router = require('express').Router();
// const Expenses = require('../models/expenseModel');

// router.post('/', async (req, res) => {
//   const { title, amount } = req.body;
//   const expense = new Expenses({ title, amount });

//   try {
//     await expense.save();
//     res.status(200).json({ message: 'Expense saved successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to save expense' });
//   }
// });

// router.get('/', async (req, res) => {
//     const expense = await Expenses.find({ });
  
//     try {
//       res.status(200).json({ data: expense });
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to save expense' });
//     }
//   });

//   router.delete('/:id', async (req, res) => {
//     try {
//       const removed = await Expenses.findByIdAndDelete(req.params.id);
//       if (!removed) {
//         return res.status(404).json({ error: 'Expense not found' });
//       }
//       res.json({ message: 'Expense deleted successfully' });
//     } catch (err) {
//       console.error('Delete error:', err);
//       res.status(500).json({ error: 'Failed to delete expense' });
//     }
//   });
// module.exports = router;
const router = require('express').Router();
const Expenses = require('../models/expenseModel');

router.post('/', async (req, res) => {
  const { title, amount } = req.body;
  
  // Add validation
  if (!title || !amount) {
    return res.status(400).json({ error: 'Title and amount are required' });
  }
  
  const expense = new Expenses({ title, amount });

  try {
    await expense.save();
    res.status(200).json({ message: 'Expense saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save expense' });
  }
});

router.get('/', async (req, res) => {
  try {
    const expenses = await Expenses.find({});
    res.status(200).json({ data: expenses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Add DELETE route
router.delete('/:id', async (req, res) => {
  try {
    const removed = await Expenses.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
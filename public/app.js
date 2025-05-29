const list = document.getElementById('list');
const form = document.getElementById('form');

// async function loadExpenses() {
//   try {
//     const res = await fetch('/expenses');
//     const data = await res.json();
//     list.innerHTML = data
//       .map(
//         e => `
//       <li>
//         <span>${e.title}: \$${e.amount}</span>
//         <button class="delete-btn" onclick="deleteExpense('${e._id}')">&times;</button>
//       </li>
//     `
//       )
//       .join('');
//   } catch (err) {
//     console.error('Failed to load expenses:', err);
//   }
// }
async function loadExpenses() {
    try {
      const res  = await fetch('/expenses');
      const json = await res.json();
      // if the response is { data: [...] }, pull out the array:
      const items = Array.isArray(json) ? json : json.data;
  
      list.innerHTML = items
        .map(e => `
          <li>
            <span>${e.title}: $${e.amount}</span>
            <button class="delete-btn" onclick="deleteExpense('${e._id}')">&times;</button>
          </li>
        `)
        .join('');
    } catch (err) {
      console.error('Failed to load expenses:', err);
    }
  }

  
async function deleteExpense(id) {
  try {
    await fetch(`/expenses/${id}`, { method: 'DELETE' });
    loadExpenses();
  } catch (err) {
    console.error('Failed to delete expense:', err);
  }
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData(form);
  const payload = {
    title: formData.get('title').trim(),
    amount: parseFloat(formData.get('amount'))
  };

  if (!payload.title || isNaN(payload.amount)) {
    return alert('Please enter a valid title and amount.');
  }

  try {
    await fetch('/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    form.reset();
    loadExpenses();
  } catch (err) {
    console.error('Failed to add expense:', err);
  }
});

loadExpenses();

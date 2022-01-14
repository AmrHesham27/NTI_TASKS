const createMyOwnElement = (element) => {
    let newElement = document.createElement(element.tag);
    if(element.classList){ newElement.classList = element.classList};
    if(element.innerText){ newElement.innerText = element.innerText};
    if(element.attributes){ 
        element.attributes.forEach(att => {
            newElement.setAttribute(att[0], att[1])
        })
    }
    if(element.parent){ element.parent.appendChild(newElement) }
    return newElement
}
const createMyOwnElements = (elements=[]) => {
    let newElements = [];
    elements.forEach(element => {
        const newElement = createMyOwnElement(element);
        newElements.push(newElement);
    })
    return newElements
}
const  createTable = (data , parent, exclude=[],buttonsName, buttonsFunction) => {
    const heads = Object.keys(data[0]).filter(key => {
        if (!exclude.includes(key)){return key}
    });
    // creata head of the table
    const thead = createMyOwnElement({tag:'thead', parent});
    const trOfHead = createMyOwnElement({tag:'tr', parent:thead});
    heads.forEach(head => {
       createMyOwnElement({tag:'th', parent:trOfHead, innerText:head})
    });
    if (buttonsName) { createMyOwnElement({tag:'th', parent:trOfHead, innerText:buttonsName}) }
    // create body of the table 
    const tbody = createMyOwnElement({tag:'tbody', parent});
    data.forEach((item, index) => {
        const trOfBody = createMyOwnElement({tag:'tr', parent:tbody});
        heads.forEach(head => {
            createMyOwnElement({tag:'td', parent:trOfBody, innerText:item[head]});
        });
        if (buttonsFunction) {
            buttonsFunction(trOfBody, item, index)
        }
    });
};
const createMessageTable = (parent, innerText, classList) => {
    const tbody = createMyOwnElement({ tag:'tbody', parent });
    const tr= createMyOwnElement({ tag:'tr', parent:tbody, classList});
    createMyOwnElement({tage:'td', parent:tr, innerText});
}
const customerMainHeads = [
    {name:"name",dataStore:"value"},
    {name:"address", dataStore:"value"},
    {name:"phone", dataStore:"value"},
    {name:"accNum", dataStore:"value", type:'id'},
    {name:"Balance", dataStore:"value"},
    {name:'transactions'}
]
const cutomerHeadsNoTrans = customerMainHeads.filter(head => {
    return head.name !== 'transactions'
})
const getCustomers = () => {
    return customers = localStorage.getItem('customers') ? JSON.parse(localStorage.getItem('customers')) : [];
}
const generateAccId = () => {
    let customers = getCustomers()
    if (customers.length){ return id = customers[customers.length - 1]['accNum'] + 1; }
    else { return id = 5000}
}
const generateTransactionId = () => {
    return Date.now()
}
const getCustomerData = () => {
    let customers = getCustomers();
    let customerIndex = JSON.parse(localStorage.getItem('customerIndex'));
    let customer = customers[customerIndex]
    return [customers, customer]
}
/* this part is for add.html */
const addCustomerForm = document.querySelector('#addCustomer');
if (addCustomerForm) {
    addCustomerForm.addEventListener('submit', function(e){
        e.preventDefault()
        let customers = getCustomers();
        let newCustomer = {};
        customerMainHeads.forEach(head => {
            if (addCustomerForm.elements[head.name]){
                newCustomer[head.name] = this.elements[head.name][head.dataStore]
            }
        });
        newCustomer.accNum = generateAccId();
        newCustomer.transactions = [];
        customers.push(newCustomer);
        localStorage.setItem('customers', JSON.stringify(customers));
        window.location.replace('index.html');
    })
}
/* this part is for index.html */
const createButtons = (parent, customer, customerIndex) => {
    const td = createMyOwnElement({tag:'td', parent:parent});
    const [edit, single ,del, transaction] = createMyOwnElements([
        {tag:'button', parent:td, classList:"btn btn-warning mx-3", innerText:"edit"},
        {tag:'button', parent:td, classList:"btn btn-primary mx-3", innerText:"single"},
        {tag:'button', parent:td, classList:"btn btn-danger mx-3", innerText:"delete"},
        {tag:'button', parent:td, classList:"btn btn-success mx-3", innerText:"new transaction"}
    ]);
    edit.addEventListener('click', () => editCusromer(customerIndex))
    single.addEventListener('click', () => showSingleCustomer(customerIndex));
    del.addEventListener('click', () => deleteCustomer(parent, customer));
    transaction.addEventListener('click', () => newTransaction(customerIndex));
    return td
}
const editCusromer = (customerIndex) => {
    localStorage.setItem('customerIndex', JSON.stringify(customerIndex));
    window.location.replace('edit.html');
}
const showSingleCustomer = (customerIndex) => {
    localStorage.setItem('customerIndex', JSON.stringify(customerIndex));
    window.location.replace('single.html');
}
const deleteCustomer = (parentElement, delCustomer) => {
    let allCustomers = getCustomers();
    allCustomers = allCustomers.filter(customer => {
        return customer.accNum != delCustomer.accNum
    });
    parentElement.remove();
    localStorage.setItem('customers', JSON.stringify(allCustomers));
}
const newTransaction = (customerIndex) => {
    localStorage.setItem('customerIndex', JSON.stringify(customerIndex));
    window.location.replace('newTransaction.html');
}
const content = document.querySelector('#content');
const contentThead = document.querySelector('#contentThead')
if (content) {
    const customers = getCustomers();
    if (customers.length){
    createTable(customers, content, ['transactions'], 'Actions', createButtons);
    }
    else {
        createMyOwnElement({ 
            tag:'tr', parent:content, classList:'alert alert-danger text-center', innerText:'No customers yet'
        });
    }
}
/* this part is for transaction page*/
const transactionTable = document.querySelector('#transactionTable')
if(transactionTable){
    const [customers , customer] = getCustomerData();
    let transactions = customer['transactions'];
    createTable([customer], transactionTable, ['transactions']);
    transactionForm.addEventListener('submit', function(e){
        e.preventDefault();
        // get Data and make claculations
            let amount = +transactionForm.elements['amount']['value'];
            let transactionType = transactionForm.elements['transcation']['value'];
            let newBalance = transactionType == 'deposit' ? 
                (amount + +customer['Balance']) : (+customer['Balance'] - amount);
            let result = newBalance >= 0 ? true : false;
        // was the transaction successful ?
            if (result) {
                alert('transaction was done');
                customer['Balance'] = newBalance;
                transactions.push({
                    type: transactionType,
                    amount,
                    id: generateTransactionId()
                });
                transactionTable.innerHTML = '';
                createTable([customer], transactionTable, ['transactions']);
                localStorage.setItem('customers', JSON.stringify(customers));
            } 
            else { alert ('balance is not sufficent'); }
            transactionForm.reset();
    })
}
/* this part is for single.html*/
const singleCustomerTable = document.querySelector('#singleCustomerTable');
const singleCustomerTransactions = document.querySelector('#singleCustomerTransactions');
if(singleCustomerTable){
    const [customers , customer] = getCustomerData();
    let transactions = customer['transactions'];
    createTable([customer], singleCustomerTable, exclude=['transactions']);
    if (transactions.length) { createTable(transactions, singleCustomerTransactions); }
    else {
        createMessageTable(singleCustomerTransactions,'No transaction yet', 'alert alert-danger text-center' )
    }
}
/* this part is for edit.html */
const editCustomerForm = document.querySelector('#editCustomerForm')
if (editCustomerForm) {
    const [customers , customer] = getCustomerData();
    customerMainHeads.forEach(head => {
        if(editCustomerForm.elements[head.name]){
            editCustomerForm.elements[head.name][head.dataStore] = customer[head.name]
        };
    });
    editCustomerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        customerMainHeads.forEach (head => {
            if (editCustomerForm.elements[head.name]) {
                customer[head.name] = editCustomerForm.elements[head.name][head.dataStore]
            }
        })
        localStorage.setItem('customers', JSON.stringify(customers));
        alert('customer was edited');
    })
}
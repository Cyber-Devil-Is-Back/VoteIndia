// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract SwarajToken {
    string public name = "SwarajToken";
    string public symbol = "SWJ";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event BatchTransfer(address indexed from, address indexed to, uint256 amount);
    event BatchBurn(address indexed holder, uint256 amount);
    event Minted(address indexed to, uint256 amount);
    event TokensBurned(uint256 totalSupplyBurned);
    event GasSent(address indexed recipient, uint256 amount);
    event GasFundsDeposited(uint256 amount);
    event GasFundsWithdrawn(uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        require(to != address(0), "Invalid address");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address user, address spender) public view returns (uint256) {
        return allowances[user][spender];
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "Invalid address");
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(to != address(0), "Invalid address");
        require(balances[from] >= amount, "Insufficient balance");
        require(allowances[from][msg.sender] >= amount, "Allowance exceeded");

        balances[from] -= amount;
        balances[to] += amount;
        allowances[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }

    /// ✅ Use contract's own balance to send gas for recipients
    function batchTransfer(address[] calldata recipients) external onlyOwner {
        require(recipients.length > 0, "No recipients provided");

        uint256 tokenUnit = 1 ;
        uint256 gasRequired = recipients.length * 0.001 ether;

        require(balances[owner] >= recipients.length * tokenUnit, "Not enough tokens");
        require(address(this).balance >= gasRequired, "Insufficient contract gas balance");

        for (uint256 i = 0; i < recipients.length; i++) {
            balances[owner] -= tokenUnit;
            balances[recipients[i]] += tokenUnit;
            emit BatchTransfer(msg.sender, recipients[i], tokenUnit);

            payable(recipients[i]).transfer(0.001 ether);
            emit GasSent(recipients[i], 0.001 ether);
        }
    }

    function batchBurn(address[] calldata holders) external onlyOwner {
        require(holders.length > 0, "No holders provided");

        uint256 tokenUnit = 1 * 10 ** uint256(decimals);

        for (uint256 i = 0; i < holders.length; i++) {
            require(balances[holders[i]] >= tokenUnit, "Insufficient balance to burn");
            balances[holders[i]] -= tokenUnit;
            totalSupply -= tokenUnit;
            emit BatchBurn(holders[i], tokenUnit);
        }
    }

    function mint(uint256 amount) external onlyOwner {
        require(amount > 0, "Mint amount must be greater than zero");

        balances[owner] += amount;
        totalSupply += amount;
        emit Minted(owner, amount);
    }

    function burnAllTokens() external onlyOwner {
        totalSupply = 0;
        balances[owner] = 0;
        emit TokensBurned(totalSupply);
    }

    function depositGasFunds() external payable onlyOwner {
        require(msg.value > 0, "No ether sent");
        emit GasFundsDeposited(msg.value);
    }

    function withdrawGasFunds(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Not enough funds");
        payable(owner).transfer(amount);
        emit GasFundsWithdrawn(amount);
    }
}

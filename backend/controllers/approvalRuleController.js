const ApprovalRule = require('../models/approvalRuleModel');

const getRules = async (req, res) => {
  const rules = await ApprovalRule.findAll();
  res.json(rules);
};

const createRule = async (req, res) => {
  const { name, condition } = req.body;
  const newRule = await ApprovalRule.create({ name, condition });
  res.status(201).json(newRule);
};

const updateRule = async (req, res) => {
    const { name, condition } = req.body;
    const updatedRule = await ApprovalRule.update(req.params.id, { name, condition });
    res.json(updatedRule);
};

const deleteRule = async (req, res) => {
    await ApprovalRule.delete(req.params.id);
    res.json({ message: 'Rule deleted' });
};

module.exports = { getRules, createRule, updateRule, deleteRule };
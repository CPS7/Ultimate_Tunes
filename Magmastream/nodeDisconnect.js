module.exports = (client, node, reason) => {
    console.log(`Node "${node.options.identifier}" Disconnected , Reason: ${JSON.stringify(reason)}.`);
  };
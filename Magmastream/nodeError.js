module.exports = (client, node, error) => {
    console.log(`Error while trying to connect "${node.options.identifier}" , Error: ${error.message}.`);
  };
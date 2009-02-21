// alert(message, title) - Show an alert dialog
function alert(message, title) {
	javax.swing.JOptionPane.showMessageDialog(null, (message || "").toString(), (title || "").toString(), javax.swing.JOptionPane.INFORMATION_MESSAGE);
}

// confirm(message, title) - Show a confirmation dialog
function confirm(message, title) {
	return 0 == javax.swing.JOptionPane.showConfirmDialog(null, (message || "").toString(), (title || "").toString(), javax.swing.JOptionPane.YES_NO_OPTION);
}

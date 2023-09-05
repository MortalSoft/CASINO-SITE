<div class="flex justify-center p-2">
	You were banned by <?php echo $ban['name'];?> for <?php echo $ban['reason'];?>. The restriction expires <?php echo ($ban['expire'] == -1) ? 'never' : makeDate($ban['expire']); ?>.
</div>
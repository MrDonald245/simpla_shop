<?php

require_once('View.php');

/**
 * Working with Ukrposhta API
 *
 * Created by Eugene.
 * User: eugene
 * Date: 13/03/18
 * Time: 13:38
 */
class UkrposhtaView extends View
{
    function fetch()
    {
        return $this->design->fetch('ukrposhta.tpl');
    }
}